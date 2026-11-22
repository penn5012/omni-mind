import { z } from 'zod';

// ============================================================================
// 1. Multi-Channel SSE Event Schemas
// ============================================================================

export const ThinkingStepSchema = z.object({
  id: z.string(),
  label: z.string(),
  detail: z.string(),
  status: z.enum(['running', 'completed']),
});

export const ThinkingEventSchema = z.object({
  durationMs: z.number(),
  steps: z.array(ThinkingStepSchema),
});

export const TextDeltaEventSchema = z.object({
  delta: z.string(),
});

export const CitationItemSchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string(),
  chunkId: z.string(),
  createdAt: z.string(),
  rrfScore: z.number(),
  snippet: z.string(),
  highlightedTerm: z.string(),
  tags: z.array(z.string()),
});

export const CitationsEventSchema = z.object({
  items: z.array(CitationItemSchema),
});

// ============================================================================
// 2. Four Generative UI Native Card Schemas
// ============================================================================

export const ScheduleCardSchema = z.object({
  cardType: z.literal('schedule_card'),
  cardId: z.string(),
  title: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  hasConflict: z.boolean(),
  reminderMinutes: z.number(),
});

export const ExpenseItemSchema = z.object({
  name: z.string(),
  price: z.number(),
});

export const ExpenseCardSchema = z.object({
  cardType: z.literal('expense_card'),
  cardId: z.string(),
  merchant: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  category: z.string(),
  date: z.string(),
  confidence: z.number(),
  items: z.array(ExpenseItemSchema),
  monthlyRatioPercent: z.number(),
});

export const ToolApprovalCardSchema = z.object({
  cardType: z.literal('tool_approval_card'),
  cardId: z.string(),
  toolName: z.string(),
  mcpServer: z.string(),
  actionSummary: z.string(),
  scheduledTime: z.string(),
  conflictCheck: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
});

export const AnalyticsCategorySchema = z.object({
  label: z.string(),
  amount: z.number(),
  percent: z.number(),
  colorToken: z.enum(['accentPrimary', 'accentCyan', 'statusSuccess']),
});

export const AnalyticsCardSchema = z.object({
  cardType: z.literal('analytics_card'),
  cardId: z.string(),
  periodTitle: z.string(),
  totalAmount: z.number(),
  categories: z.array(AnalyticsCategorySchema),
  aiInsight: z.string(),
});

export const UiCardEventSchema = z.discriminatedUnion('cardType', [
  ScheduleCardSchema,
  ExpenseCardSchema,
  ToolApprovalCardSchema,
  AnalyticsCardSchema,
]);

export const UsageMetricsEventSchema = z.object({
  ttftMs: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
  estimatedCostUsd: z.number(),
  modelUsed: z.string(),
  fallbackTriggered: z.boolean(),
  traceUrl: z.string(),
});

// ============================================================================
// 3. Request & Approval Payloads
// ============================================================================

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  modelId: z.enum(['gemini-2.5-flash', 'gemini-2.5-pro', 'deepseek-v3-fallback']).default('gemini-2.5-flash'),
  enableFallback: z.boolean().default(true),
  enableOnDeviceMasking: z.boolean().default(true),
  scenarioHint: z.enum(['auto', 'whiteboard_schedule', 'receipt_expense', 'rag_budget', 'monthly_analytics']).optional(),
  imageAttachment: z
    .object({
      fileName: z.string(),
      mimeType: z.string(),
      base64Data: z.string().optional(),
      maskedCount: z.number().default(0),
    })
    .optional(),
});

export const ToolApprovalRequestSchema = z.object({
  cardId: z.string(),
  toolName: z.string(),
  approved: z.boolean(),
});

export type ThinkingEvent = z.infer<typeof ThinkingEventSchema>;
export type TextDeltaEvent = z.infer<typeof TextDeltaEventSchema>;
export type CitationItem = z.infer<typeof CitationItemSchema>;
export type CitationsEvent = z.infer<typeof CitationsEventSchema>;
export type ScheduleCard = z.infer<typeof ScheduleCardSchema>;
export type ExpenseCard = z.infer<typeof ExpenseCardSchema>;
export type ToolApprovalCard = z.infer<typeof ToolApprovalCardSchema>;
export type AnalyticsCard = z.infer<typeof AnalyticsCardSchema>;
export type UiCardEvent = z.infer<typeof UiCardEventSchema>;
export type UsageMetricsEvent = z.infer<typeof UsageMetricsEventSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ToolApprovalRequest = z.infer<typeof ToolApprovalRequestSchema>;
