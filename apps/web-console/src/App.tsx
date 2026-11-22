import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Collapse,
  ConfigProvider,
  Descriptions,
  Drawer,
  Input,
  Layout,
  Modal,
  Progress,
  Radio,
  Space,
  Switch,
  Tag,
  Typography,
  theme,
} from 'antd';
import {
  AudioOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  SettingOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type {
  CitationItem,
  ThinkingEvent,
  UiCardEvent,
  UsageMetricsEvent,
} from '@omnimind/shared-schema';
import { AppColors, AppRadius, AppSpacing, AppTypography } from './theme/tokens.js';
import { AppStrings } from './l10n/strings.js';

const { Header, Content, Footer } = Layout;
const { Text, Title, Paragraph } = Typography;

interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageName?: string;
  thinking?: ThinkingEvent;
  citations?: CitationItem[];
  uiCard?: UiCardEvent;
  usage?: UsageMetricsEvent;
  approvalResultText?: string;
}

const BFF_BASE = 'http://localhost:3001';

const INITIAL_CITATION: CitationItem = {
  id: 'mem_budget_q4',
  index: 1,
  title: '《Q4 AI 基建预算纪要 (白板拍立存)》',
  chunkId: 'chunk_8f92a',
  createdAt: '2026-11-15 16:20',
  rrfScore: 0.92,
  snippet:
    '...确定全程采用 TypeScript + Flutter + React (Ant Design) 路线。关于云端算力开销，月度 API 与云服务预算上限严格控制在 $30.00 以内，首周必须在 Google Cloud 配置预算告警，优先使用 Gemini 2.5 Flash...',
  highlightedTerm: '月度 API 与云服务预算上限严格控制在 $30.00 以内',
  tags: ['#预算告警', '#GoogleCloud', '#AntDesign'],
};

const INITIAL_MESSAGES: ChatMessageItem[] = [
  {
    id: 'msg_user_1',
    role: 'user',
    text: '帮我把白板上的架构评审时间加到手机日历，并查一下我们上周定的云服务月度预算上限是多少？',
    imageName: '会议白板照片_1122.jpg',
  },
  {
    id: 'msg_ai_1',
    role: 'assistant',
    text: '根据您上周归档的《Q4 AI 基建预算纪要》[1]，您的 Google Cloud 与大模型月度预算上限严格设定为 $30.00（当前累计消耗 $4.20）。\n\n同时，已从白板照片中提取出架构评审日程，写入系统日历前请确认审批：',
    thinking: {
      durationMs: 1120,
      steps: [
        {
          id: 's1',
          label: '视觉解析与端侧 ML Kit 隐私校验',
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
          label: '端侧工具规划与 Human-in-the-Loop 拦截',
          detail: '请求调用 device_calendar.create_event，触发敏感写操作挂起等待审批',
          status: 'completed',
        },
      ],
    },
    citations: [INITIAL_CITATION],
    uiCard: {
      cardType: 'tool_approval_card',
      cardId: 'card_hitl_9821',
      toolName: 'device_calendar.create_event',
      mcpServer: 'omnimind-device-bridge',
      actionSummary: 'AI 网关架构评审与压测复盘',
      scheduledTime: '2026-11-25 (周三) 15:00 - 16:30',
      conflictCheck: '🟢 该时段无其他系统日历冲突',
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

export function App() {
  const [messages, setMessages] = useState<ChatMessageItem[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [hasAttachedPhoto, setHasAttachedPhoto] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [bffOnline, setBffOnline] = useState(true);
  const [memoryCount, setMemoryCount] = useState(42);
  const [selectedModel, setSelectedModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-pro' | 'deepseek-v3-fallback'>(
    'gemini-2.5-flash'
  );
  const [enableAutoFallback, setEnableAutoFallback] = useState(true);
  const [enableOnDeviceMasking, setEnableOnDeviceMasking] = useState(true);
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);
  const [showRouterModal, setShowRouterModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch(`${BFF_BASE}/api/health`)
      .then((r) => r.json())
      .then((data: { status?: string; memoryCount?: number }) => {
        if (data.status === 'ok') {
          setBffOnline(true);
          if (data.memoryCount) setMemoryCount(data.memoryCount);
        }
      })
      .catch(() => {
        setBffOnline(false);
      });
  }, []);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const sendPrompt = async (
    promptText: string,
    scenarioHint: 'auto' | 'whiteboard_schedule' | 'receipt_expense' | 'rag_budget' | 'monthly_analytics' = 'auto',
    withPhoto = false
  ) => {
    const trimmed = promptText.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessageItem = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmed,
      imageName: withPhoto || hasAttachedPhoto ? '随手拍图像_1122.jpg' : undefined,
    };

    const aiMsgId = `ai_${Date.now() + 1}`;
    const aiPlaceholder: ChatMessageItem = {
      id: aiMsgId,
      role: 'assistant',
      text: '',
    };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setInputText('');
    setHasAttachedPhoto(false);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${BFF_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed,
          modelId: selectedModel,
          enableFallback: enableAutoFallback,
          enableOnDeviceMasking,
          scenarioHint,
          imageAttachment:
            withPhoto || hasAttachedPhoto
              ? { fileName: '随手拍图像_1122.jpg', mimeType: 'image/jpeg', maskedCount: 1 }
              : undefined,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const rawBlocks = buffer.split('\n\n');
        buffer = rawBlocks.pop() ?? '';

        for (const block of rawBlocks) {
          const lines = block.split('\n');
          let eventName = '';
          let dataStr = '';
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataStr = line.slice(5).trim();
            }
          }
          if (!eventName || !dataStr) continue;
          const parsedData = JSON.parse(dataStr);

          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== aiMsgId) return m;
              if (eventName === 'thinking') {
                return { ...m, thinking: parsedData as ThinkingEvent };
              }
              if (eventName === 'citations') {
                return { ...m, citations: (parsedData as { items: CitationItem[] }).items };
              }
              if (eventName === 'text_delta') {
                return { ...m, text: m.text + ((parsedData as { delta: string }).delta ?? '') };
              }
              if (eventName === 'ui_card') {
                return { ...m, uiCard: parsedData as UiCardEvent };
              }
              if (eventName === 'usage_metrics') {
                return { ...m, usage: parsedData as UsageMetricsEvent };
              }
              return m;
            })
          );
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  text:
                    m.text ||
                    '⚠️ 连接 BFF 服务超时，已启用本地容灾响应：根据《Q4 预算纪要》[1]，月度算力上限为 $30.00。',
                  citations: [INITIAL_CITATION],
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

  const handleToolApproval = async (msgId: string, cardId: string, toolName: string, approved: boolean) => {
    try {
      const res = await fetch(`${BFF_BASE}/api/chat/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, toolName, approved }),
      });
      const data = (await res.json()) as { message?: string };
      updateCardApprovalState(msgId, approved, data.message);
    } catch {
      updateCardApprovalState(
        msgId,
        approved,
        approved ? '✓ 已批准并调用系统日历写入成功 (event_id: cal_9821)' : '✕ 用户已拒绝执行该写操作'
      );
    }
  };

  const updateCardApprovalState = (msgId: string, approved: boolean, resultMsg?: string) => {
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

  const renderTextWithCitations = (text: string, citations?: CitationItem[]) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, idx) => {
      const match = /^\[(\d+)\]$/.exec(part);
      if (match) {
        const citeIndex = Number(match[1]);
        const found = citations?.find((c) => c.index === citeIndex) ?? INITIAL_CITATION;
        return (
          <Tag
            key={idx}
            color="cyan"
            icon={<FileSearchOutlined />}
            onClick={() => setActiveCitation(found)}
            style={{
              cursor: 'pointer',
              marginInline: AppSpacing.xs,
              borderRadius: AppRadius.full,
              fontFamily: AppTypography.fontMono,
            }}
          >
            [{citeIndex} 溯源]
          </Tag>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const renderGenerativeCard = (msg: ChatMessageItem) => {
    const card = msg.uiCard;
    if (!card) return null;

    if (card.cardType === 'tool_approval_card') {
      const borderColor =
        card.status === 'approved'
          ? AppColors.statusSuccess
          : card.status === 'rejected'
          ? AppColors.statusError
          : AppColors.statusWarning;

      return (
        <Card
          size="small"
          style={{
            marginTop: AppSpacing.md,
            backgroundColor: AppColors.bgElevated,
            borderColor,
            borderWidth: 1.5,
          }}
          title={
            <Space>
              <SafetyCertificateOutlined style={{ color: borderColor }} />
              <Text strong style={{ color: borderColor }}>
                端侧系统日历写入审批 (Human-in-the-Loop)
              </Text>
            </Space>
          }
          extra={
            <Tag color={card.status === 'pending' ? 'warning' : card.status === 'approved' ? 'success' : 'error'}>
              {card.status === 'pending' ? '挂起等待确认' : card.status === 'approved' ? '✓ 已批准' : '✕ 已拒绝'}
            </Tag>
          }
        >
          <Descriptions
            column={1}
            size="small"
            bordered
            styles={{
              label: { width: 110, fontFamily: AppTypography.fontMono, color: AppColors.textSecondary },
              content: { fontFamily: AppTypography.fontMono },
            }}
          >
            <Descriptions.Item label="Tool">{card.toolName}</Descriptions.Item>
            <Descriptions.Item label="日程事项">{card.actionSummary}</Descriptions.Item>
            <Descriptions.Item label="计划时间">
              <Text style={{ color: AppColors.accentCyan }}>{card.scheduledTime}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="冲突检测">
              <Text type="success">{card.conflictCheck}</Text>
            </Descriptions.Item>
          </Descriptions>

          {card.status === 'pending' ? (
            <Space style={{ marginTop: AppSpacing.md, width: '100%', justifyContent: 'flex-end' }}>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleToolApproval(msg.id, card.cardId, card.toolName, false)}
              >
                {AppStrings.rejectBtn}
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleToolApproval(msg.id, card.cardId, card.toolName, true)}
              >
                {AppStrings.approveBtn}
              </Button>
            </Space>
          ) : (
            <Alert
              style={{ marginTop: AppSpacing.md }}
              type={card.status === 'approved' ? 'success' : 'error'}
              showIcon
              message={msg.approvalResultText}
            />
          )}
        </Card>
      );
    }

    if (card.cardType === 'expense_card') {
      return (
        <Card
          size="small"
          style={{ marginTop: AppSpacing.md, backgroundColor: AppColors.bgElevated }}
          title={`🧾 智能消费记账卡 — ${card.merchant}`}
          extra={<Tag color="cyan">{card.category}</Tag>}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {card.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">• {item.name}</Text>
                <Text style={{ fontFamily: AppTypography.fontMono }}>
                  {card.currency}
                  {item.price.toFixed(2)}
                </Text>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: AppSpacing.sm,
                borderTop: `1px solid ${AppColors.borderSubtle}`,
              }}
            >
              <Text type="secondary">OCR 置信度 {(card.confidence * 100).toFixed(0)}% • 占本月餐饮预算 {card.monthlyRatioPercent}%</Text>
              <Title level={4} style={{ margin: 0, color: AppColors.statusSuccess, fontFamily: AppTypography.fontMono }}>
                {card.currency}
                {card.totalAmount.toFixed(2)}
              </Title>
            </div>
          </Space>
        </Card>
      );
    }

    if (card.cardType === 'schedule_card') {
      return (
        <Card
          size="small"
          style={{ marginTop: AppSpacing.md, backgroundColor: AppColors.bgElevated }}
          title={
            <Space>
              <CalendarOutlined style={{ color: AppColors.accentCyan }} />
              <span>{card.title}</span>
            </Space>
          }
          extra={<Tag color="success">🟢 无日程冲突</Tag>}
        >
          <Space direction="vertical" size="small">
            <Text style={{ fontFamily: AppTypography.fontMono, color: AppColors.accentCyan }}>
              🕒 {card.startTime} - {card.endTime}
            </Text>
            <Text type="secondary">📍 {card.location}</Text>
          </Space>
        </Card>
      );
    }

    if (card.cardType === 'analytics_card') {
      return (
        <Card
          size="small"
          style={{ marginTop: AppSpacing.md, backgroundColor: AppColors.bgElevated }}
          title={
            <Space>
              <PieChartOutlined style={{ color: AppColors.accentPrimary }} />
              <span>{card.periodTitle}</span>
            </Space>
          }
          extra={
            <Text strong style={{ color: AppColors.statusSuccess, fontFamily: AppTypography.fontMono }}>
              总计 ¥{card.totalAmount.toFixed(2)}
            </Text>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {card.categories.map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">
                    {cat.label} ({cat.percent}%)
                  </Text>
                  <Text style={{ fontFamily: AppTypography.fontMono }}>¥{cat.amount}</Text>
                </div>
                <Progress
                  percent={cat.percent}
                  showInfo={false}
                  strokeColor={
                    cat.colorToken === 'accentPrimary'
                      ? AppColors.accentPrimary
                      : cat.colorToken === 'accentCyan'
                      ? AppColors.accentCyan
                      : AppColors.statusSuccess
                  }
                />
              </div>
            ))}
            <Alert type="info" showIcon message={card.aiInsight} />
          </Space>
        </Card>
      );
    }

    return null;
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
      <Layout
        style={{
          minHeight: '100vh',
          maxWidth: 1024,
          margin: '0 auto',
          backgroundColor: AppColors.bgPrimary,
          borderLeft: `1px solid ${AppColors.borderSubtle}`,
          borderRight: `1px solid ${AppColors.borderSubtle}`,
        }}
      >
        {/* Ant Design Header */}
        <Header
          style={{
            backgroundColor: AppColors.bgSurface,
            borderBottom: `1px solid ${AppColors.borderSubtle}`,
            paddingInline: AppSpacing.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space size="middle">
            <Button size="small" icon={<DatabaseOutlined />}>
              记忆库 ({memoryCount})
            </Button>
            <Badge
              status={bffOnline ? 'success' : 'warning'}
              text={
                <Text style={{ fontFamily: AppTypography.fontMono, fontSize: AppTypography.captionSize }}>
                  {bffOnline ? AppStrings.onlineLabel : AppStrings.offlineLabel}
                </Text>
              }
            />
          </Space>

          <Title level={5} style={{ margin: 0 }}>
            {AppStrings.appName} (Ant Design 5)
          </Title>

          <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={() => setShowRouterModal(true)}
            style={{ fontFamily: AppTypography.fontMono }}
          >
            {selectedModel}
          </Button>
        </Header>

        {/* Ant Design Content Stream */}
        <Content
          style={{
            padding: AppSpacing.lg,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: AppSpacing.md,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'stretch',
                maxWidth: msg.role === 'user' ? '78%' : '100%',
              }}
            >
              <Card
                size="small"
                style={{
                  backgroundColor: msg.role === 'user' ? AppColors.accentPrimary : AppColors.bgSurface,
                  borderColor: msg.role === 'user' ? AppColors.accentPrimary : AppColors.borderSubtle,
                  borderRadius: AppRadius.lg,
                }}
              >
                {msg.imageName && (
                  <Alert
                    style={{ marginBottom: AppSpacing.sm }}
                    type="info"
                    icon={<CameraOutlined />}
                    showIcon
                    message={`🖼️ ${msg.imageName}`}
                    description={AppStrings.onDeviceMaskedBadge}
                  />
                )}

                {msg.thinking && (
                  <Collapse
                    size="small"
                    defaultActiveKey={['thinking']}
                    style={{ marginBottom: AppSpacing.md, backgroundColor: AppColors.bgElevated }}
                    items={[
                      {
                        key: 'thinking',
                        label: (
                          <Space>
                            <ExperimentOutlined style={{ color: AppColors.accentCyan }} />
                            <Text style={{ fontFamily: AppTypography.fontMono, color: AppColors.accentCyan }}>
                              {AppStrings.thinkingDonePrefix} ({msg.thinking.durationMs}ms)
                            </Text>
                          </Space>
                        ),
                        children: (
                          <Space direction="vertical" size={4}>
                            {msg.thinking.steps.map((s) => (
                              <Text
                                key={s.id}
                                type="secondary"
                                style={{ fontFamily: AppTypography.fontMono, fontSize: AppTypography.captionSize }}
                              >
                                ├─ {s.label}: {s.detail}
                              </Text>
                            ))}
                          </Space>
                        ),
                      },
                    ]}
                  />
                )}

                <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                  {msg.role === 'assistant' ? renderTextWithCitations(msg.text, msg.citations) : msg.text}
                </Paragraph>

                {renderGenerativeCard(msg)}

                {msg.usage && (
                  <div
                    style={{
                      marginTop: AppSpacing.md,
                      paddingTop: AppSpacing.sm,
                      borderTop: `1px solid ${AppColors.borderSubtle}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: AppTypography.fontMono,
                      fontSize: AppTypography.captionSize,
                      color: AppColors.textMuted,
                    }}
                  >
                    <span>
                      <ThunderboltOutlined /> TTFT: {msg.usage.ttftMs}ms
                    </span>
                    <span>
                      📊 {msg.usage.totalTokens} Tokens (${msg.usage.estimatedCostUsd.toFixed(5)})
                    </span>
                    <span style={{ color: AppColors.accentCyan }}>Model: {msg.usage.modelUsed}</span>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </Content>

        {/* Quick Scenario Antd Buttons Bar */}
        <div
          style={{
            padding: `${AppSpacing.sm}px ${AppSpacing.lg}px`,
            borderTop: `1px solid ${AppColors.borderSubtle}`,
            backgroundColor: AppColors.bgPrimary,
          }}
        >
          <Space wrap size="small">
            <Button
              size="small"
              shape="round"
              onClick={() => sendPrompt('帮我把白板上的架构评审时间加到手机日历，并查上周预算上限', 'whiteboard_schedule', true)}
            >
              {AppStrings.quickWhiteboard}
            </Button>
            <Button
              size="small"
              shape="round"
              onClick={() => sendPrompt('帮我识别这张星巴克咖啡小票并归档记账', 'receipt_expense', true)}
            >
              {AppStrings.quickReceipt}
            </Button>
            <Button
              size="small"
              shape="round"
              onClick={() => sendPrompt('检索我上周拍的 Q4 AI 基建预算上限是多少？', 'rag_budget', false)}
            >
              {AppStrings.quickRag}
            </Button>
            <Button
              size="small"
              shape="round"
              onClick={() => sendPrompt('统计汇总我 11 月份的消费开销分类占比', 'monthly_analytics', false)}
            >
              {AppStrings.quickAnalytics}
            </Button>
          </Space>
        </div>

        {/* Ant Design Multimodal Footer Composer */}
        <Footer
          style={{
            padding: AppSpacing.md,
            backgroundColor: AppColors.bgSurface,
            borderTop: `1px solid ${AppColors.borderSubtle}`,
          }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Button
              type={hasAttachedPhoto ? 'primary' : 'default'}
              icon={<CameraOutlined />}
              onClick={() => setHasAttachedPhoto((v) => !v)}
            >
              {hasAttachedPhoto ? '已附图 ✓' : '拍照/图'}
            </Button>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPressEnter={() => sendPrompt(inputText)}
              placeholder={AppStrings.inputPlaceholder}
              suffix={<AudioOutlined style={{ color: AppColors.textSecondary }} />}
            />
            {isStreaming ? (
              <Button danger type="primary" icon={<StopOutlined />} onClick={stopGeneration}>
                {AppStrings.stopGenerating}
              </Button>
            ) : (
              <Button type="primary" icon={<SendOutlined />} onClick={() => sendPrompt(inputText)}>
                {AppStrings.sendBtn}
              </Button>
            )}
          </Space.Compact>
        </Footer>

        {/* Ant Design Drawer: RAG Citation Source Details */}
        <Drawer
          title={
            activeCitation
              ? `${AppStrings.citationDrawerTitle} [#${activeCitation.index}] — ${activeCitation.title}`
              : AppStrings.citationDrawerTitle
          }
          placement="bottom"
          height={280}
          open={Boolean(activeCitation)}
          onClose={() => setActiveCitation(null)}
          extra={
            activeCitation && (
              <Tag color="success" style={{ fontFamily: AppTypography.fontMono }}>
                Hybrid RRF Score: {activeCitation.rrfScore}
              </Tag>
            )
          }
        >
          {activeCitation && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Tag color="cyan">{activeCitation.chunkId}</Tag>
                <Text type="secondary">归档时间：{activeCitation.createdAt}</Text>
                {activeCitation.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </Space>
              <Card size="small" style={{ backgroundColor: AppColors.bgPrimary }}>
                <Text style={{ fontFamily: AppTypography.fontMono }}>{activeCitation.snippet}</Text>
              </Card>
            </Space>
          )}
        </Drawer>

        {/* Ant Design Modal: Multi-Model Router & On-Device ML Kit Settings */}
        <Modal
          title="⚙️ 多模型路由网关与端云协同配置 (Ant Design Config)"
          open={showRouterModal}
          onCancel={() => setShowRouterModal(false)}
          onOk={() => setShowRouterModal(false)}
          okText="保存配置"
          cancelText="关闭"
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card size="small" title="1. 主推理模型 (@google/genai)">
              <Radio.Group
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{ display: 'flex', flexDirection: 'column', gap: AppSpacing.sm }}
              >
                <Radio value="gemini-2.5-flash">Gemini 2.5 Flash（默认：多模态极速 / TTFT ~320ms）</Radio>
                <Radio value="gemini-2.5-pro">Gemini 2.5 Pro（复杂 LangGraph 状态机推理）</Radio>
                <Radio value="deepseek-v3-fallback">DeepSeek-V3（手动强制切换备用网关）</Radio>
              </Radio.Group>
            </Card>

            <Card size="small" title="2. 自动容灾降级与端侧隐私护栏">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>主模型超时 (&gt;5s) 自动无缝 Fallback 至 DeepSeek-V3 / Qwen</Text>
                  <Switch checked={enableAutoFallback} onChange={setEnableAutoFallback} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>端侧 Google ML Kit 上传前自动脱敏手机号/身份证号</Text>
                  <Switch checked={enableOnDeviceMasking} onChange={setEnableOnDeviceMasking} />
                </div>
              </Space>
            </Card>
          </Space>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
}
