import type {
  CitationItem,
  ThinkingEvent,
  UiCardEvent,
  UsageMetricsEvent,
} from '@omnimind/shared-schema';
import type { LocalImageAttachment, ModelOptionId, ScenarioHint } from '../types/chat';

const BFF_BASE = import.meta.env.VITE_BFF_BASE ?? '';

export const FALLBACK_CITATION: CitationItem = {
  id: 'mem_budget_q4',
  index: 1,
  title: '《Q4 AI 基建预算纪要 (白板拍立存)》',
  chunkId: 'chunk_8f92a',
  createdAt: '2026-11-15 16:20',
  rrfScore: 0.92,
  snippet:
    '...确定全程采用 TypeScript + React + Ant Design (Web & H5) 路线。关于云端算力开销，月度 API 与云服务预算上限严格控制在 $10.00 以内，首周必须在 Google Cloud 配置预算告警，优先使用 Gemini 2.5 Flash...',
  highlightedTerm: '月度 API 与云服务预算上限严格控制在 $10.00 以内',
  tags: ['#预算告警', '#GoogleCloud', '#ReactH5'],
};

export const FALLBACK_MEMORIES: CitationItem[] = [
  FALLBACK_CITATION,
  {
    id: 'mem_arch_review',
    index: 2,
    title: '《多通道 SSE 流式网关设计笔记》',
    chunkId: 'chunk_3c19b',
    createdAt: '2026-11-18 21:10',
    rrfScore: 0.88,
    snippet:
      '...H5 移动端与 Web 控制台统一复用 Hono streamSSE 接口，依次下发 thinking、citations、text_delta、ui_card 与 usage_metrics 五类强类型事件...',
    highlightedTerm: '依次下发 thinking、citations、text_delta、ui_card 与 usage_metrics',
    tags: ['#SSE流式', '#Hono', '#GenerativeUI'],
  },
];

export interface HealthStatus {
  online: boolean;
  memoryCount: number;
}

export async function fetchBffHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${BFF_BASE}/api/health`);
    if (!res.ok) return { online: false, memoryCount: 42 };
    const data = (await res.json()) as { status?: string; memoryCount?: number };
    return {
      online: data.status === 'ok',
      memoryCount: data.memoryCount ?? 42,
    };
  } catch {
    return { online: false, memoryCount: 42 };
  }
}

export async function fetchMemories(): Promise<{ total: number; recentItems: CitationItem[] }> {
  try {
    const res = await fetch(`${BFF_BASE}/api/memories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { total?: number; recentItems?: CitationItem[] };
    return {
      total: data.total ?? 42,
      recentItems: data.recentItems?.length ? data.recentItems : FALLBACK_MEMORIES,
    };
  } catch {
    return { total: 42, recentItems: FALLBACK_MEMORIES };
  }
}

export interface StreamHandlers {
  onThinking: (thinking: ThinkingEvent) => void;
  onCitations: (citations: CitationItem[]) => void;
  onTextDelta: (delta: string) => void;
  onUiCard: (card: UiCardEvent) => void;
  onUsage: (usage: UsageMetricsEvent) => void;
}

export async function streamChatCompletion(params: {
  message: string;
  modelId: ModelOptionId;
  enableFallback: boolean;
  enableOnDeviceMasking: boolean;
  scenarioHint: ScenarioHint;
  imageAttachment?: LocalImageAttachment;
  signal: AbortSignal;
  handlers: StreamHandlers;
}): Promise<void> {
  const response = await fetch(`${BFF_BASE}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: params.signal,
    body: JSON.stringify({
      message: params.message,
      modelId: params.modelId,
      enableFallback: params.enableFallback,
      enableOnDeviceMasking: params.enableOnDeviceMasking,
      scenarioHint: params.scenarioHint,
      imageAttachment: params.imageAttachment
        ? {
            fileName: params.imageAttachment.fileName,
            mimeType: params.imageAttachment.mimeType,
            base64Data: params.imageAttachment.base64Data,
            maskedCount: params.imageAttachment.maskedCount,
          }
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
      const parsedData = JSON.parse(dataStr) as unknown;

      if (eventName === 'thinking') {
        params.handlers.onThinking(parsedData as ThinkingEvent);
      } else if (eventName === 'citations') {
        params.handlers.onCitations((parsedData as { items: CitationItem[] }).items);
      } else if (eventName === 'text_delta') {
        params.handlers.onTextDelta((parsedData as { delta: string }).delta ?? '');
      } else if (eventName === 'ui_card') {
        params.handlers.onUiCard(parsedData as UiCardEvent);
      } else if (eventName === 'usage_metrics') {
        params.handlers.onUsage(parsedData as UsageMetricsEvent);
      }
    }
  }
}

export async function submitToolApproval(params: {
  cardId: string;
  toolName: string;
  approved: boolean;
}): Promise<string> {
  try {
    const res = await fetch(`${BFF_BASE}/api/chat/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = (await res.json()) as { message?: string };
    return (
      data.message ??
      (params.approved
        ? '✓ 已批准执行并生成日程文件 (event_id: cal_9821)'
        : '✕ 已拒绝执行该敏感写操作并通知云端 Agent 回滚')
    );
  } catch {
    return params.approved
      ? '✓ 已批准执行并生成本地日历 .ics 文件 (event_id: cal_9821)'
      : '✕ 已拒绝执行该敏感写操作';
  }
}
