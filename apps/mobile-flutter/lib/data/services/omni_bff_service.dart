import 'dart:async';
import '../models/chat_models.dart';

class OmniStreamChunk {
  final ThinkingEventModel? thinking;
  final List<CitationModel>? citations;
  final String? textDelta;
  final UiCardModel? uiCard;
  final UsageMetricsModel? usage;

  const OmniStreamChunk({
    this.thinking,
    this.citations,
    this.textDelta,
    this.uiCard,
    this.usage,
  });
}

class OmniBffService {
  static const CitationModel defaultCitation = CitationModel(
    id: 'mem_budget_q4',
    index: 1,
    title: '《Q4 AI 基建预算纪要 (白板拍立存)》',
    chunkId: 'chunk_8f92a',
    createdAt: '2026-11-15 16:20',
    rrfScore: 0.92,
    snippet:
        '...确定全程采用 TypeScript + Flutter 路线。关于云端算力开销，月度 API 与云服务预算上限严格控制在 \$30.00 以内，首周必须在 Google Cloud 配置预算告警...',
    highlightedTerm: '月度 API 与云服务预算上限严格控制在 \$30.00 以内',
  );

  Stream<OmniStreamChunk> streamChat({
    required String message,
    required String modelId,
    String scenarioHint = 'auto',
  }) async* {
    final String lower = message.toLowerCase();
    final bool isExpense = scenarioHint == 'receipt_expense' ||
        lower.contains('小票') ||
        lower.contains('星巴克') ||
        lower.contains('记账');
    final bool isAnalytics = scenarioHint == 'monthly_analytics' ||
        lower.contains('统计') ||
        lower.contains('消费分类') ||
        lower.contains('汇总');
    final bool isRag = scenarioHint == 'rag_budget' || lower.contains('检索');

    // Step 1: Thinking Event
    yield OmniStreamChunk(
      thinking: ThinkingEventModel(
        durationMs: isExpense ? 920 : 1120,
        steps: isExpense
            ? const [
                ThinkingStepModel(
                  id: 's1',
                  label: '视觉 OCR 识别',
                  detail: '商户「星巴克臻选」，总计 ¥68.00 (置信度 99%)',
                ),
                ThinkingStepModel(
                  id: 's2',
                  label: 'Generative UI 卡片映射',
                  detail: '构建消费记账卡片 (expense_card)',
                ),
              ]
            : const [
                ThinkingStepModel(
                  id: 's1',
                  label: '视觉解析与端侧 ML Kit 脱敏',
                  detail: '提取事项「AI 网关架构评审」，时间「周三 15:00」',
                ),
                ThinkingStepModel(
                  id: 's2',
                  label: 'Hybrid RAG 混合检索',
                  detail: '召回《Q4 预算纪要》(RRF Score: 0.92)',
                ),
                ThinkingStepModel(
                  id: 's3',
                  label: '端侧工具审批拦截',
                  detail: '调用 device_calendar.create_event (挂起待确认)',
                ),
              ],
      ),
    );

    // Step 2: Citations Event
    yield const OmniStreamChunk(citations: [defaultCitation]);

    // Step 3: Stream Text Deltas
    final List<String> deltas = isExpense
        ? [
            '已为您识别星巴克消费小票，并对照《Q4 预算纪要》[1]：\n',
            '本次消费 ¥68.00（冰美式 ¥32 + 牛肉可颂 ¥36），请确认归档：',
          ]
        : isAnalytics
            ? [
                '已汇总 11 月个人记忆库消费统计（对照《Q4 预算纪要》[1]）：\n',
                '本月累计 ¥3,420.00，云服务 API 消耗 \$4.20 处于安全阈值内：',
              ]
            : isRag
                ? [
                    '根据您归档的《Q4 AI 基建预算纪要》[1]，月度云服务与 API 预算上限严格控制在 \$30.00 以内。\n',
                    '已为您同步提取下周技术分享日程卡：',
                  ]
                : [
                    '根据《Q4 AI 基建预算纪要》[1]，您的月度预算上限为 \$30.00（当前已消耗 \$4.20）。\n',
                    '同时已提取白板上的架构评审日程，写入系统日历前请确认审批：',
                  ];

    for (final String part in deltas) {
      await Future<void>.delayed(const Duration(milliseconds: 25));
      yield OmniStreamChunk(textDelta: part);
    }

    // Step 4: Generative UI Card Event
    if (isExpense) {
      yield const OmniStreamChunk(
        uiCard: UiCardModel(
          cardType: 'expense_card',
          cardId: 'card_exp_101',
          title: 'Starbucks Reserve 星巴克臻选',
          subtitle: '冰美式咖啡 ¥32.00 + 法式牛肉可颂 ¥36.00',
          extraInfo: '餐饮美食 • 占本月餐饮预算 62%',
          amount: 68.0,
        ),
      );
    } else if (isAnalytics) {
      yield const OmniStreamChunk(
        uiCard: UiCardModel(
          cardType: 'analytics_card',
          cardId: 'card_ana_202',
          title: '11 月消费分类占比汇总',
          subtitle: '餐饮美食 44% (¥1,520) | 云服务订阅 29% (¥980) | 交通 27% (¥920)',
          extraInfo: '💡 云服务 API 消耗 \$4.20 < \$30.00 预算红线',
          amount: 3420.0,
        ),
      );
    } else if (isRag) {
      yield const OmniStreamChunk(
        uiCard: UiCardModel(
          cardType: 'schedule_card',
          cardId: 'card_sch_303',
          title: 'Flutter × AI 流式架构技术复盘',
          subtitle: '2026-11-26 (周四) 14:00 - 15:30',
          extraInfo: '飞书线上会议 • 提前 15 分钟提醒',
        ),
      );
    } else {
      yield const OmniStreamChunk(
        uiCard: UiCardModel(
          cardType: 'tool_approval_card',
          cardId: 'card_hitl_9821',
          title: 'AI 网关架构评审与压测复盘',
          subtitle: '2026-11-25 (周三) 15:00 - 16:30',
          extraInfo: 'Tool: device_calendar.create_event • 🟢 无冲突',
        ),
      );
    }

    // Step 5: LLMOps Usage Metrics
    yield OmniStreamChunk(
      usage: UsageMetricsModel(
        ttftMs: 340,
        totalTokens: 486,
        costUsd: 0.00018,
        modelUsed: modelId,
      ),
    );
  }
}
