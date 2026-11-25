import type {
  CitationItem,
  ThinkingEvent,
  UiCardEvent,
  UsageMetricsEvent,
} from '@omnimind/shared-schema';

export type ModelOptionId = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'deepseek-v3-fallback';

export type ScenarioHint =
  | 'auto'
  | 'whiteboard_schedule'
  | 'receipt_expense'
  | 'rag_budget'
  | 'monthly_analytics';

export interface LocalImageAttachment {
  fileName: string;
  mimeType: string;
  previewUrl?: string;
  base64Data?: string;
  maskedCount: number;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  imageAttachment?: LocalImageAttachment;
  thinking?: ThinkingEvent;
  citations?: CitationItem[];
  uiCard?: UiCardEvent;
  usage?: UsageMetricsEvent;
  approvalResultText?: string;
  archivedExpense?: boolean;
}
