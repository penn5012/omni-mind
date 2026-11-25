import React, { useEffect, useRef, useState } from 'react';
import { Alert, Card, ConfigProvider, Space, Tag, Typography, message, theme } from 'antd';
import { CameraOutlined, FileSearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { CitationItem } from '@omnimind/shared-schema';
import { AppColors, AppRadius, AppSpacing, AppTypography } from './theme/tokens';
import { AppStrings } from './l10n/strings';
import type { ChatMessageItem, LocalImageAttachment, ModelOptionId, ScenarioHint } from './types/chat';
import {
  FALLBACK_CITATION,
  FALLBACK_MEMORIES,
  fetchBffHealth,
  fetchMemories,
  streamChatCompletion,
  submitToolApproval,
} from './services/bffClient';
import { maskSensitiveText, startH5VoiceRecognition } from './utils/h5NativeBridge';
import { TopModelBar } from './components/TopModelBar';
import { ThinkingAccordion } from './components/ThinkingAccordion';
import { GenerativeCardRenderer } from './components/GenerativeCardRenderer';
import { CitationDrawer } from './components/CitationDrawer';
import { ModelRouterDrawer } from './components/ModelRouterDrawer';
import { MemoryDrawer } from './components/MemoryDrawer';
import { MultimodalComposer } from './components/MultimodalComposer';

const { Paragraph, Text } = Typography;

const INITIAL_MESSAGES: ChatMessageItem[] = [
  {
    id: 'msg_user_1',
    role: 'user',
    createdAt: '10:42',
    text: '帮我把白板上的架构评审时间加到日历，并查一下我们上周定的云服务月度预算上限是多少？',
    imageAttachment: {
      fileName: '会议白板照片_1122.jpg',
      mimeType: 'image/jpeg',
      maskedCount: 1,
    },
  },
  {
    id: 'msg_ai_1',
    role: 'assistant',
    createdAt: '10:42',
    text: '根据您上周归档的《Q4 AI 基建预算纪要》[1]，您的 Google Cloud 与大模型月度预算上限严格设定为 $10.00（当前累计消耗 $4.20）。\n\n同时，已从白板照片中提取出架构评审日程，导出至系统日历前请确认审批：',
    thinking: {
      durationMs: 1120,
      steps: [
        {
          id: 's1',
          label: '多模态视觉解析与 H5 本地隐私脱敏',
          detail: '提取白板事项「AI 网关架构评审与压测复盘」，时间「周三 15:00-16:30」',
          status: 'completed',
        },
        {
          id: 's2',
          label: 'Hybrid RAG 记忆混合检索',
          detail: '召回《Q4 AI 基建预算纪要》(chunk_8f92a, RRF Score: 0.92)',
          status: 'completed',
        },
        {
          id: 's3',
          label: '工具规划与 Human-in-the-Loop 拦截',
          detail: '请求调用 calendar.export_ics，触发敏感写操作挂起等待确认',
          status: 'completed',
        },
      ],
    },
    citations: [FALLBACK_CITATION],
    uiCard: {
      cardType: 'tool_approval_card',
      cardId: 'card_hitl_9821',
      toolName: 'device_calendar.create_event',
      mcpServer: 'omnimind-h5-bridge',
      actionSummary: 'AI 网关架构评审与压测复盘',
      scheduledTime: '2026-11-25 (周三) 15:00 - 16:30',
      conflictCheck: '🟢 该时段无其他日程冲突',
      status: 'pending',
    },
    usage: {
      ttftMs: 340,
      inputTokens: 318,
      outputTokens: 168,
      totalTokens: 486,
      estimatedCostUsd: 0.00018,
      modelUsed: 'gemini-2.5-flash',
      fallbackTriggered: false,
      traceUrl: 'https://cloud.langfuse.com/trace/omnimind-hitl-9821',
    },
  },
];

function nowTimeLabel(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function App() {
  const [messages, setMessages] = useState<ChatMessageItem[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<LocalImageAttachment | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [bffOnline, setBffOnline] = useState(true);
  const [memoryCount, setMemoryCount] = useState(42);
  const [memories, setMemories] = useState<CitationItem[]>(FALLBACK_MEMORIES);
  const [selectedModel, setSelectedModel] = useState<ModelOptionId>('gemini-2.5-flash');
  const [enableAutoFallback, setEnableAutoFallback] = useState(true);
  const [enableOnDeviceMasking, setEnableOnDeviceMasking] = useState(true);
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);
  const [showRouterDrawer, setShowRouterDrawer] = useState(false);
  const [showMemoryDrawer, setShowMemoryDrawer] = useState(false);

  const [msgApi, contextHolder] = message.useMessage();
  const abortControllerRef = useRef<AbortController | null>(null);
  const stopVoiceRef = useRef<(() => void) | null>(null);
  const streamEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void fetchBffHealth().then((status) => {
      setBffOnline(status.online);
      setMemoryCount(status.memoryCount);
    });
    void fetchMemories().then((res) => {
      setMemoryCount(res.total);
      setMemories(res.recentItems);
    });
  }, []);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleToggleVoice = () => {
    if (isListening && stopVoiceRef.current) {
      stopVoiceRef.current();
      stopVoiceRef.current = null;
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const stopFn = startH5VoiceRecognition({
      onResult: (transcript) => {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      },
      onEnd: () => {
        setIsListening(false);
        stopVoiceRef.current = null;
      },
      onUnsupported: () => {
        setIsListening(false);
        void msgApi.info(AppStrings.voiceUnsupportedHint);
      },
    });
    stopVoiceRef.current = stopFn;
  };

  const handleSendPrompt = async (
    rawText: string,
    scenarioHint: ScenarioHint = 'auto',
    forcePhoto = false
  ) => {
    const trimmed = rawText.trim();
    if (!trimmed || isStreaming) return;

    const { maskedText, maskedCount } = enableOnDeviceMasking
      ? maskSensitiveText(trimmed)
      : { maskedText: trimmed, maskedCount: 0 };

    if (maskedCount > 0) {
      void msgApi.success(`端侧隐私护栏已自动脱敏 ${maskedCount} 处敏感信息`);
    }

    const effectivePhoto: LocalImageAttachment | undefined =
      attachedPhoto ??
      (forcePhoto
        ? { fileName: '随手拍图像_1122.jpg', mimeType: 'image/jpeg', maskedCount: 1 }
        : undefined);

    const userMsg: ChatMessageItem = {
      id: `user_${Date.now()}`,
      role: 'user',
      createdAt: nowTimeLabel(),
      text: maskedText,
      imageAttachment: effectivePhoto,
    };

    const aiMsgId = `ai_${Date.now() + 1}`;
    const aiPlaceholder: ChatMessageItem = {
      id: aiMsgId,
      role: 'assistant',
      createdAt: nowTimeLabel(),
      text: '',
    };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setInputText('');
    setAttachedPhoto(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamChatCompletion({
        message: maskedText,
        modelId: selectedModel,
        enableFallback: enableAutoFallback,
        enableOnDeviceMasking,
        scenarioHint,
        imageAttachment: effectivePhoto,
        signal: controller.signal,
        handlers: {
          onThinking: (thinking) => {
            setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, thinking } : m)));
          },
          onCitations: (citations) => {
            setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, citations } : m)));
          },
          onTextDelta: (delta) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, text: m.text + delta } : m))
            );
          },
          onUiCard: (uiCard) => {
            setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, uiCard } : m)));
          },
          onUsage: (usage) => {
            setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, usage } : m)));
          },
        },
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setBffOnline(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  text:
                    m.text ||
                    '⚠️ 当前未连接到本地 BFF 服务，已自动启用 H5 本地容灾响应：根据《Q4 预算纪要》[1]，月度算力上限为 $10.00。请先在根目录运行 pnpm dev:bff 启动后端。',
                  citations: [FALLBACK_CITATION],
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleToolApproval = async (
    msgId: string,
    cardId: string,
    toolName: string,
    approved: boolean
  ) => {
    const resultMsg = await submitToolApproval({ cardId, toolName, approved });
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || !m.uiCard || m.uiCard.cardType !== 'tool_approval_card') return m;
        return {
          ...m,
          uiCard: {
            ...m.uiCard,
            status: approved ? 'approved' : 'rejected',
          },
          approvalResultText: resultMsg,
        };
      })
    );
  };

  const handleArchiveExpense = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, archivedExpense: true } : m))
    );
    setMemoryCount((c) => c + 1);
    void msgApi.success('消费记录已归档至个人记忆库');
  };

  const renderTextWithCitations = (text: string, citations?: CitationItem[]) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, idx) => {
      const match = /^\[(\d+)\]$/.exec(part);
      if (match) {
        const citeIndex = Number(match[1]);
        const found = citations?.find((c) => c.index === citeIndex) ?? FALLBACK_CITATION;
        return (
          <Tag
            key={idx}
            color="cyan"
            icon={<FileSearchOutlined />}
            onClick={() => setActiveCitation(found)}
            style={{
              cursor: 'pointer',
              marginInline: 3,
              borderRadius: AppRadius.full,
              fontFamily: AppTypography.fontMono,
              fontSize: 11,
            }}
          >
            [{citeIndex} 溯源]
          </Tag>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: AppColors.accentPrimary,
          colorInfo: AppColors.accentCyan,
          colorSuccess: AppColors.statusSuccess,
          colorWarning: AppColors.statusWarning,
          colorError: AppColors.statusError,
          colorBgBase: AppColors.bgPrimary,
          colorBgContainer: AppColors.bgSurface,
          colorBgElevated: AppColors.bgElevated,
          colorBorder: AppColors.borderSubtle,
          borderRadius: AppRadius.md,
          fontFamily: AppTypography.fontSans,
        },
      }}
    >
      {contextHolder}
      <div className="h5-shell">
        <TopModelBar
          memoryCount={memoryCount}
          bffOnline={bffOnline}
          selectedModel={selectedModel}
          onOpenMemories={() => setShowMemoryDrawer(true)}
          onOpenModelRouter={() => setShowRouterDrawer(true)}
        />

        <main className="h5-stream-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'stretch',
                maxWidth: msg.role === 'user' ? '86%' : '100%',
                minWidth: 0,
              }}
            >
              <Card
                size="small"
                styles={{ body: { padding: AppSpacing.md } }}
                style={{
                  backgroundColor: msg.role === 'user' ? AppColors.accentPrimary : AppColors.bgSurface,
                  borderColor: msg.role === 'user' ? AppColors.accentPrimary : AppColors.borderSubtle,
                  borderRadius: AppRadius.lg,
                }}
              >
                {msg.imageAttachment && (
                  <div style={{ marginBottom: AppSpacing.sm }}>
                    {msg.imageAttachment.previewUrl ? (
                      <img
                        src={msg.imageAttachment.previewUrl}
                        alt={msg.imageAttachment.fileName}
                        style={{
                          width: '100%',
                          maxHeight: 160,
                          objectFit: 'cover',
                          borderRadius: AppRadius.sm,
                          marginBottom: AppSpacing.xs,
                          border: `1px solid ${AppColors.overlayDark}`,
                        }}
                      />
                    ) : null}
                    <Alert
                      type="info"
                      icon={<CameraOutlined />}
                      showIcon
                      message={<span style={{ fontSize: 12 }}>🖼️ {msg.imageAttachment.fileName}</span>}
                      description={<span style={{ fontSize: 11 }}>{AppStrings.onDeviceMaskedBadge}</span>}
                    />
                  </div>
                )}

                {msg.thinking && <ThinkingAccordion thinking={msg.thinking} />}

                <Paragraph
                  className="h5-break-word"
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.65,
                    fontSize: AppTypography.bodySize,
                  }}
                >
                  {msg.role === 'assistant'
                    ? renderTextWithCitations(msg.text || '思考中...', msg.citations)
                    : msg.text}
                </Paragraph>

                <GenerativeCardRenderer
                  msg={msg}
                  onToolApproval={handleToolApproval}
                  onArchiveExpense={handleArchiveExpense}
                />

                {msg.usage && (
                  <Space
                    wrap
                    size={[10, 4]}
                    style={{
                      marginTop: AppSpacing.md,
                      paddingTop: AppSpacing.sm,
                      width: '100%',
                      borderTop: `1px solid ${AppColors.borderSubtle}`,
                      fontFamily: AppTypography.fontMono,
                      fontSize: 11,
                      color: AppColors.textMuted,
                    }}
                  >
                    <span>
                      <ThunderboltOutlined /> TTFT: {msg.usage.ttftMs}ms
                    </span>
                    <span>
                      📊 {msg.usage.totalTokens} Tokens (${msg.usage.estimatedCostUsd.toFixed(5)})
                    </span>
                    <Text style={{ color: AppColors.accentCyan, fontSize: 11, fontFamily: AppTypography.fontMono }}>
                      {msg.usage.modelUsed}
                    </Text>
                  </Space>
                )}
              </Card>
            </div>
          ))}
          <div ref={streamEndRef} />
        </main>

        <MultimodalComposer
          inputText={inputText}
          isStreaming={isStreaming}
          isListening={isListening}
          attachedPhoto={attachedPhoto}
          onChangeInput={setInputText}
          onAttachPhoto={setAttachedPhoto}
          onToggleVoice={handleToggleVoice}
          onSend={handleSendPrompt}
          onStop={handleStopGeneration}
        />

        <CitationDrawer citation={activeCitation} onClose={() => setActiveCitation(null)} />

        <MemoryDrawer
          open={showMemoryDrawer}
          totalCount={memoryCount}
          memories={memories}
          onSelectMemory={(item) => setActiveCitation(item)}
          onClose={() => setShowMemoryDrawer(false)}
        />

        <ModelRouterDrawer
          open={showRouterDrawer}
          selectedModel={selectedModel}
          enableAutoFallback={enableAutoFallback}
          enableOnDeviceMasking={enableOnDeviceMasking}
          onChangeModel={setSelectedModel}
          onChangeAutoFallback={setEnableAutoFallback}
          onChangeMasking={setEnableOnDeviceMasking}
          onClose={() => setShowRouterDrawer(false)}
        />
      </div>
    </ConfigProvider>
  );
}
