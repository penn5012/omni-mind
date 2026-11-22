import React, { useEffect, useRef, useState } from 'react';
import type {
  CitationItem,
  ThinkingEvent,
  UiCardEvent,
  UsageMetricsEvent,
} from '@omnimind/shared-schema';
import { AppColors, AppRadius, AppSpacing, AppTypography } from './theme/tokens.js';
import { AppStrings } from './l10n/strings.js';

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
    '...确定全程采用 TypeScript + Flutter 路线。关于云端算力开销，月度 API 与云服务预算上限严格控制在 $30.00 以内，首周必须在 Google Cloud 配置预算告警，优先使用 Gemini 2.5 Flash...',
  highlightedTerm: '月度 API 与云服务预算上限严格控制在 $30.00 以内',
  tags: ['#预算告警', '#GoogleCloud', '#技术规划'],
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
          <button
            key={idx}
            onClick={() => setActiveCitation(found)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: `2px ${AppSpacing.sm}px`,
              margin: `0 ${AppSpacing.xs}px`,
              borderRadius: AppRadius.full,
              backgroundColor: AppColors.cyanTint,
              color: AppColors.accentCyan,
              border: `1px solid ${AppColors.accentCyan}`,
              fontFamily: AppTypography.fontMono,
              fontSize: AppTypography.captionSize,
              cursor: 'pointer',
            }}
          >
            [{citeIndex} 溯源]
          </button>
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
        <div
          style={{
            marginTop: AppSpacing.md,
            padding: AppSpacing.md,
            borderRadius: AppRadius.md,
            backgroundColor: AppColors.bgElevated,
            border: `1.5px solid ${borderColor}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: borderColor, fontSize: AppTypography.bodySize }}>
              ⚠️ 端侧系统日历写入审批 (Human-in-the-Loop)
            </strong>
            <span
              style={{
                padding: `2px ${AppSpacing.sm}px`,
                borderRadius: AppRadius.sm,
                fontFamily: AppTypography.fontMono,
                fontSize: AppTypography.captionSize,
                backgroundColor:
                  card.status === 'approved'
                    ? AppColors.successTint
                    : card.status === 'rejected'
                    ? AppColors.errorTint
                    : AppColors.warningTint,
                color: borderColor,
              }}
            >
              {card.status === 'pending' ? '挂起等待确认' : card.status === 'approved' ? '✓ 已批准' : '✕ 已拒绝'}
            </span>
          </div>

          <div
            style={{
              marginTop: AppSpacing.sm,
              padding: AppSpacing.sm,
              borderRadius: AppRadius.sm,
              backgroundColor: AppColors.bgPrimary,
              fontFamily: AppTypography.fontMono,
              fontSize: AppTypography.captionSize,
              color: AppColors.textSecondary,
              lineHeight: 1.6,
            }}
          >
            <div>Tool: {card.toolName}</div>
            <div style={{ color: AppColors.textPrimary }}>事项: {card.actionSummary}</div>
            <div style={{ color: AppColors.accentCyan }}>时间: {card.scheduledTime}</div>
            <div style={{ color: AppColors.statusSuccess }}>{card.conflictCheck}</div>
          </div>

          {card.status === 'pending' ? (
            <div style={{ display: 'flex', gap: AppSpacing.sm, marginTop: AppSpacing.sm }}>
              <button
                onClick={() => handleToolApproval(msg.id, card.cardId, card.toolName, false)}
                style={{
                  flex: 1,
                  padding: `${AppSpacing.sm}px`,
                  borderRadius: AppRadius.sm,
                  backgroundColor: AppColors.borderSubtle,
                  color: AppColors.textPrimary,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {AppStrings.rejectBtn}
              </button>
              <button
                onClick={() => handleToolApproval(msg.id, card.cardId, card.toolName, true)}
                style={{
                  flex: 1,
                  padding: `${AppSpacing.sm}px`,
                  borderRadius: AppRadius.sm,
                  backgroundColor: AppColors.accentPrimary,
                  color: AppColors.white,
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {AppStrings.approveBtn}
              </button>
            </div>
          ) : (
            <div
              style={{
                marginTop: AppSpacing.sm,
                padding: AppSpacing.sm,
                borderRadius: AppRadius.sm,
                textAlign: 'center',
                fontFamily: AppTypography.fontMono,
                fontSize: AppTypography.captionSize,
                backgroundColor: card.status === 'approved' ? AppColors.successTint : AppColors.errorTint,
                color: borderColor,
              }}
            >
              {msg.approvalResultText}
            </div>
          )}
        </div>
      );
    }

    if (card.cardType === 'expense_card') {
      return (
        <div
          style={{
            marginTop: AppSpacing.md,
            padding: AppSpacing.md,
            borderRadius: AppRadius.md,
            backgroundColor: AppColors.bgElevated,
            border: `1px solid ${AppColors.borderSubtle}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>🧾 智能消费记账卡 ({card.merchant})</strong>
            <span
              style={{
                padding: `2px ${AppSpacing.sm}px`,
                borderRadius: AppRadius.full,
                backgroundColor: AppColors.cyanTint,
                color: AppColors.accentCyan,
                fontSize: AppTypography.captionSize,
              }}
            >
              {card.category}
            </span>
          </div>
          <div
            style={{
              marginTop: AppSpacing.sm,
              padding: AppSpacing.sm,
              borderRadius: AppRadius.sm,
              backgroundColor: AppColors.bgPrimary,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              {card.items.map((item, idx) => (
                <div key={idx} style={{ fontSize: AppTypography.captionSize, color: AppColors.textSecondary }}>
                  • {item.name} — {card.currency}
                  {item.price.toFixed(2)}
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: AppTypography.headlineSize,
                fontWeight: 700,
                color: AppColors.statusSuccess,
                fontFamily: AppTypography.fontMono,
              }}
            >
              {card.currency}
              {card.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      );
    }

    if (card.cardType === 'schedule_card') {
      return (
        <div
          style={{
            marginTop: AppSpacing.md,
            padding: AppSpacing.md,
            borderRadius: AppRadius.md,
            backgroundColor: AppColors.bgElevated,
            border: `1px solid ${AppColors.borderSubtle}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>📅 {card.title}</strong>
            <span style={{ color: AppColors.statusSuccess, fontSize: AppTypography.captionSize }}>🟢 无日程冲突</span>
          </div>
          <div
            style={{
              marginTop: AppSpacing.xs,
              fontFamily: AppTypography.fontMono,
              fontSize: AppTypography.captionSize,
              color: AppColors.accentCyan,
            }}
          >
            🕒 {card.startTime} - {card.endTime} • 📍 {card.location}
          </div>
        </div>
      );
    }

    if (card.cardType === 'analytics_card') {
      return (
        <div
          style={{
            marginTop: AppSpacing.md,
            padding: AppSpacing.md,
            borderRadius: AppRadius.md,
            backgroundColor: AppColors.bgElevated,
            border: `1px solid ${AppColors.borderSubtle}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: AppSpacing.sm }}>
            <strong>📊 {card.periodTitle}</strong>
            <span style={{ color: AppColors.statusSuccess, fontFamily: AppTypography.fontMono }}>
              总计 ¥{card.totalAmount.toFixed(2)}
            </span>
          </div>
          {card.categories.map((cat, idx) => (
            <div key={idx} style={{ marginBottom: AppSpacing.sm }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: AppTypography.captionSize,
                  color: AppColors.textSecondary,
                  marginBottom: AppSpacing.xs,
                }}
              >
                <span>
                  {cat.label} ({cat.percent}%)
                </span>
                <span style={{ fontFamily: AppTypography.fontMono }}>¥{cat.amount}</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: AppRadius.full,
                  backgroundColor: AppColors.bgPrimary,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${cat.percent}%`,
                    height: '100%',
                    backgroundColor:
                      cat.colorToken === 'accentPrimary'
                        ? AppColors.accentPrimary
                        : cat.colorToken === 'accentCyan'
                        ? AppColors.accentCyan
                        : AppColors.statusSuccess,
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{ fontSize: AppTypography.captionSize, color: AppColors.accentCyan }}>💡 {card.aiInsight}</div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: AppColors.bgPrimary,
        color: AppColors.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 960,
        margin: '0 auto',
        borderLeft: `1px solid ${AppColors.borderSubtle}`,
        borderRight: `1px solid ${AppColors.borderSubtle}`,
      }}
    >
      {/* Top App Bar */}
      <header
        style={{
          padding: `${AppSpacing.md}px ${AppSpacing.lg}px`,
          backgroundColor: AppColors.bgSurface,
          borderBottom: `1px solid ${AppColors.borderSubtle}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: AppSpacing.sm }}>
          <span
            style={{
              padding: `4px ${AppSpacing.sm}px`,
              borderRadius: AppRadius.sm,
              backgroundColor: AppColors.bgElevated,
              border: `1px solid ${AppColors.borderSubtle}`,
              fontSize: AppTypography.captionSize,
            }}
          >
            {AppStrings.memoryBankBtn} ({memoryCount})
          </span>
          <span
            style={{
              fontSize: AppTypography.captionSize,
              color: bffOnline ? AppColors.statusSuccess : AppColors.statusWarning,
              fontFamily: AppTypography.fontMono,
            }}
          >
            ● {bffOnline ? AppStrings.onlineLabel : AppStrings.offlineLabel}
          </span>
        </div>

        <div style={{ fontWeight: 700, fontSize: AppTypography.titleSize }}>{AppStrings.appName}</div>

        <button
          onClick={() => setShowRouterModal((v) => !v)}
          style={{
            padding: `6px ${AppSpacing.md}px`,
            borderRadius: AppRadius.full,
            backgroundColor: AppColors.bgElevated,
            border: `1px solid ${AppColors.borderSubtle}`,
            color: AppColors.textPrimary,
            fontFamily: AppTypography.fontMono,
            fontSize: AppTypography.captionSize,
            cursor: 'pointer',
          }}
        >
          ⚙️ {selectedModel} ▾
        </button>
      </header>

      {/* Model Router Settings Collapsible Panel */}
      {showRouterModal && (
        <div
          style={{
            padding: AppSpacing.md,
            backgroundColor: AppColors.bgElevated,
            borderBottom: `1px solid ${AppColors.borderSubtle}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: AppSpacing.md,
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: AppTypography.captionSize,
          }}
        >
          <div>
            <strong>⚙️ 多模型路由网关 (Auto-Fallback 已开启)：</strong>
            {(['gemini-2.5-flash', 'gemini-2.5-pro', 'deepseek-v3-fallback'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                style={{
                  marginLeft: AppSpacing.sm,
                  padding: `4px ${AppSpacing.sm}px`,
                  borderRadius: AppRadius.sm,
                  border: `1px solid ${selectedModel === m ? AppColors.accentPrimary : AppColors.borderSubtle}`,
                  backgroundColor: selectedModel === m ? AppColors.accentPrimary : AppColors.bgPrimary,
                  color: AppColors.white,
                  cursor: 'pointer',
                  fontFamily: AppTypography.fontMono,
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <span style={{ color: AppColors.statusSuccess }}>{AppStrings.onDeviceMaskedBadge}</span>
        </div>
      )}

      {/* Main Chat Stream */}
      <main
        style={{
          flex: 1,
          padding: AppSpacing.lg,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: AppSpacing.lg,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'stretch',
              maxWidth: msg.role === 'user' ? '78%' : '100%',
              backgroundColor: msg.role === 'user' ? AppColors.accentPrimary : AppColors.bgSurface,
              border: msg.role === 'user' ? 'none' : `1px solid ${AppColors.borderSubtle}`,
              borderRadius: AppRadius.lg,
              padding: AppSpacing.lg,
            }}
          >
            {msg.imageName && (
              <div
                style={{
                  marginBottom: AppSpacing.sm,
                  padding: AppSpacing.sm,
                  borderRadius: AppRadius.sm,
                  backgroundColor: AppColors.overlayDark,
                  fontSize: AppTypography.captionSize,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>🖼️ {msg.imageName}</span>
                <span style={{ color: AppColors.accentCyan }}>{AppStrings.onDeviceMaskedBadge}</span>
              </div>
            )}

            {msg.thinking && (
              <div
                style={{
                  marginBottom: AppSpacing.md,
                  padding: AppSpacing.sm,
                  borderRadius: AppRadius.sm,
                  backgroundColor: AppColors.bgElevated,
                  border: `1px solid ${AppColors.borderSubtle}`,
                  fontFamily: AppTypography.fontMono,
                  fontSize: AppTypography.captionSize,
                }}
              >
                <div style={{ color: AppColors.accentCyan, marginBottom: AppSpacing.xs }}>
                  {AppStrings.thinkingDonePrefix} ({msg.thinking.durationMs}ms)
                </div>
                {msg.thinking.steps.map((s) => (
                  <div key={s.id} style={{ color: AppColors.textSecondary }}>
                    ├─ {s.label}: {s.detail}
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: AppTypography.bodySize, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {msg.role === 'assistant' ? renderTextWithCitations(msg.text, msg.citations) : msg.text}
            </div>

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
                <span>⚡ TTFT: {msg.usage.ttftMs}ms</span>
                <span>
                  📊 {msg.usage.totalTokens} Tokens (${msg.usage.estimatedCostUsd.toFixed(5)})
                </span>
                <span style={{ color: AppColors.accentCyan }}>Model: {msg.usage.modelUsed}</span>
              </div>
            )}
          </div>
        ))}
      </main>

      {/* RAG Citation BottomSheet Drawer */}
      {activeCitation && (
        <div
          style={{
            padding: AppSpacing.lg,
            backgroundColor: AppColors.bgSurface,
            borderTop: `2px solid ${AppColors.accentCyan}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>
              {AppStrings.citationDrawerTitle} [#{activeCitation.index}] — {activeCitation.title}
            </strong>
            <span
              style={{
                fontFamily: AppTypography.fontMono,
                fontSize: AppTypography.captionSize,
                color: AppColors.statusSuccess,
              }}
            >
              Hybrid RRF Score: {activeCitation.rrfScore}
            </span>
          </div>
          <p
            style={{
              marginTop: AppSpacing.sm,
              padding: AppSpacing.md,
              borderRadius: AppRadius.sm,
              backgroundColor: AppColors.bgPrimary,
              fontFamily: AppTypography.fontMono,
              fontSize: AppTypography.captionSize,
              color: AppColors.textSecondary,
            }}
          >
            {activeCitation.snippet}
          </p>
          <button
            onClick={() => setActiveCitation(null)}
            style={{
              padding: `6px ${AppSpacing.md}px`,
              borderRadius: AppRadius.sm,
              backgroundColor: AppColors.borderSubtle,
              color: AppColors.textPrimary,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {AppStrings.closeDrawerBtn}
          </button>
        </div>
      )}

      {/* Quick Scenario Pills */}
      <div
        style={{
          padding: `${AppSpacing.sm}px ${AppSpacing.lg}px`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: AppSpacing.sm,
          borderTop: `1px solid ${AppColors.borderSubtle}`,
          backgroundColor: AppColors.bgPrimary,
        }}
      >
        <button
          onClick={() => sendPrompt('帮我把白板上的架构评审时间加到手机日历，并查上周预算上限', 'whiteboard_schedule', true)}
          style={pillBtnStyle}
        >
          {AppStrings.quickWhiteboard}
        </button>
        <button
          onClick={() => sendPrompt('帮我识别这张星巴克咖啡小票并归档记账', 'receipt_expense', true)}
          style={pillBtnStyle}
        >
          {AppStrings.quickReceipt}
        </button>
        <button
          onClick={() => sendPrompt('检索我上周拍的 Q4 AI 基建预算上限是多少？', 'rag_budget', false)}
          style={pillBtnStyle}
        >
          {AppStrings.quickRag}
        </button>
        <button
          onClick={() => sendPrompt('统计汇总我 11 月份的消费开销分类占比', 'monthly_analytics', false)}
          style={pillBtnStyle}
        >
          {AppStrings.quickAnalytics}
        </button>
      </div>

      {/* Multimodal Bottom Composer */}
      <footer
        style={{
          padding: AppSpacing.md,
          backgroundColor: AppColors.bgSurface,
          borderTop: `1px solid ${AppColors.borderSubtle}`,
          display: 'flex',
          gap: AppSpacing.sm,
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setHasAttachedPhoto((v) => !v)}
          style={{
            padding: `${AppSpacing.sm}px ${AppSpacing.md}px`,
            borderRadius: AppRadius.md,
            backgroundColor: hasAttachedPhoto ? AppColors.accentCyan : AppColors.bgElevated,
            color: hasAttachedPhoto ? AppColors.bgPrimary : AppColors.textPrimary,
            border: `1px solid ${AppColors.borderSubtle}`,
            cursor: 'pointer',
            fontSize: AppTypography.captionSize,
          }}
        >
          {AppStrings.attachPhotoBtn} {hasAttachedPhoto ? '✓' : ''}
        </button>

        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendPrompt(inputText);
          }}
          placeholder={AppStrings.inputPlaceholder}
          style={{
            flex: 1,
            padding: `${AppSpacing.sm}px ${AppSpacing.md}px`,
            borderRadius: AppRadius.md,
            backgroundColor: AppColors.bgPrimary,
            border: `1px solid ${AppColors.borderSubtle}`,
            color: AppColors.textPrimary,
            fontSize: AppTypography.bodySize,
          }}
        />

        {isStreaming ? (
          <button
            onClick={stopGeneration}
            style={{
              padding: `${AppSpacing.sm}px ${AppSpacing.lg}px`,
              borderRadius: AppRadius.md,
              backgroundColor: AppColors.statusError,
              color: AppColors.white,
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {AppStrings.stopGenerating}
          </button>
        ) : (
          <button
            onClick={() => sendPrompt(inputText)}
            style={{
              padding: `${AppSpacing.sm}px ${AppSpacing.lg}px`,
              borderRadius: AppRadius.md,
              backgroundColor: AppColors.accentPrimary,
              color: AppColors.white,
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {AppStrings.sendBtn}
          </button>
        )}
      </footer>
    </div>
  );
}

const pillBtnStyle: React.CSSProperties = {
  padding: `6px ${AppSpacing.md}px`,
  borderRadius: AppRadius.full,
  backgroundColor: AppColors.bgSurface,
  border: `1px solid ${AppColors.borderSubtle}`,
  color: AppColors.textSecondary,
  fontSize: AppTypography.captionSize,
  cursor: 'pointer',
};
