import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_tokens.dart';
import '../../data/models/chat_models.dart';
import '../../data/services/omni_bff_service.dart';

class OmniWorkbenchPage extends StatefulWidget {
  const OmniWorkbenchPage({super.key});

  @override
  State<OmniWorkbenchPage> createState() => _OmniWorkbenchPageState();
}

class _OmniWorkbenchPageState extends State<OmniWorkbenchPage> {
  final OmniBffService _bffService = OmniBffService();
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final Set<String> _collapsedThinkingIds = <String>{};

  StreamSubscription<OmniStreamChunk>? _activeStreamSub;
  bool _isStreaming = false;
  bool _hasAttachedPhoto = false;
  String _selectedModel = 'gemini-2.5-flash';

  late List<ChatMessageModel> _messages;

  @override
  void initState() {
    super.initState();
    _messages = <ChatMessageModel>[
      const ChatMessageModel(
        id: 'msg_init_user',
        isUser: true,
        text: '帮我把白板上的架构评审时间加到手机日历，并查一下我们上周定的云服务月度预算上限是多少？',
        imageName: '会议白板照片_1122.jpg',
      ),
      const ChatMessageModel(
        id: 'msg_init_ai',
        isUser: false,
        text:
            '根据《Q4 AI 基建预算纪要》[1]，您的月度预算上限为 \$30.00（当前已消耗 \$4.20）。\n同时已提取白板上的架构评审日程，写入系统日历前请确认审批：',
        thinking: ThinkingEventModel(
          durationMs: 1120,
          steps: [
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
        citations: [OmniBffService.defaultCitation],
        uiCard: UiCardModel(
          cardType: 'tool_approval_card',
          cardId: 'card_hitl_9821',
          title: 'AI 网关架构评审与压测复盘',
          subtitle: '2026-11-25 (周三) 15:00 - 16:30',
          extraInfo: 'Tool: device_calendar.create_event • 🟢 无冲突',
        ),
        usage: UsageMetricsModel(
          ttftMs: 340,
          totalTokens: 486,
          costUsd: 0.00018,
          modelUsed: 'gemini-2.5-flash',
        ),
      ),
    ];
  }

  @override
  void dispose() {
    _activeStreamSub?.cancel();
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
      }
    });
  }

  void _stopStreaming() {
    _activeStreamSub?.cancel();
    _activeStreamSub = null;
    if (mounted) {
      setState(() {
        _isStreaming = false;
      });
    }
  }

  void _sendPrompt(String promptText,
      {String scenarioHint = 'auto', bool attachPhoto = false}) {
    final String trimmed = promptText.trim();
    if (trimmed.isEmpty || _isStreaming) return;

    final String userMsgId = 'user_${DateTime.now().millisecondsSinceEpoch}';
    final String aiMsgId = 'ai_${DateTime.now().millisecondsSinceEpoch + 1}';

    setState(() {
      _messages.add(
        ChatMessageModel(
          id: userMsgId,
          isUser: true,
          text: trimmed,
          imageName:
              (attachPhoto || _hasAttachedPhoto) ? '随手拍照片_1122.jpg' : null,
        ),
      );
      _messages.add(
        ChatMessageModel(
          id: aiMsgId,
          isUser: false,
          text: '',
        ),
      );
      _inputController.clear();
      _hasAttachedPhoto = false;
      _isStreaming = true;
    });

    _activeStreamSub = _bffService
        .streamChat(
      message: trimmed,
      modelId: _selectedModel,
      scenarioHint: scenarioHint,
    )
        .listen(
      (OmniStreamChunk chunk) {
        if (!mounted) return;
        setState(() {
          final int idx =
              _messages.indexWhere((ChatMessageModel m) => m.id == aiMsgId);
          if (idx == -1) return;
          ChatMessageModel current = _messages[idx];
          if (chunk.thinking != null) {
            current = current.copyWith(thinking: chunk.thinking);
          }
          if (chunk.citations != null) {
            current = current.copyWith(citations: chunk.citations);
          }
          if (chunk.textDelta != null) {
            current = current.copyWith(text: current.text + chunk.textDelta!);
          }
          if (chunk.uiCard != null) {
            current = current.copyWith(uiCard: chunk.uiCard);
          }
          if (chunk.usage != null) {
            current = current.copyWith(usage: chunk.usage);
          }
          _messages[idx] = current;
        });
        _scrollToBottom();
      },
      onDone: () {
        if (mounted) {
          setState(() {
            _isStreaming = false;
          });
        }
      },
      onError: (_) {
        if (mounted) {
          setState(() {
            _isStreaming = false;
          });
        }
      },
    );
  }

  void _updateApprovalStatus(String messageId, ApprovalStatus status) {
    setState(() {
      final int idx =
          _messages.indexWhere((ChatMessageModel m) => m.id == messageId);
      if (idx == -1) return;
      final UiCardModel? card = _messages[idx].uiCard;
      if (card == null) return;
      _messages[idx] = _messages[idx].copyWith(
        uiCard: card.copyWith(approvalStatus: status),
      );
    });
  }

  void _openCitationSheet(CitationModel citation) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
      ),
      builder: (BuildContext ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      Expanded(
                        child: Text(
                          '${AppStrings.citationSheetTitle} [#${citation.index}]',
                          style: AppTypography.title,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm,
                          vertical: AppSpacing.xs,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.bgElevated,
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        child: Text(
                          'RRF: ${citation.rrfScore}',
                          style: AppTypography.monoCaption
                              .copyWith(color: AppColors.statusSuccess),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.bgPrimary,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.borderSubtle),
                    ),
                    child: Row(
                      children: <Widget>[
                        Container(
                          width: 48,
                          height: 48,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: AppColors.bgElevated,
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                            border: Border.all(color: AppColors.accentCyan),
                          ),
                          child: Text(
                            AppStrings.origPhotoThumbLabel,
                            textAlign: TextAlign.center,
                            style: AppTypography.monoCaption.copyWith(
                              color: AppColors.accentCyan,
                              fontSize: 10,
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(citation.title, style: AppTypography.body),
                              const SizedBox(height: AppSpacing.xs),
                              Text(
                                '${citation.createdAt} • ${citation.chunkId}',
                                style: AppTypography.monoCaption,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.bgPrimary,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.borderSubtle),
                    ),
                    child: Text(citation.snippet,
                        style: AppTypography.monoCaption),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.bgElevated,
                        foregroundColor: AppColors.textPrimary,
                      ),
                      onPressed: () => Navigator.of(ctx).pop(),
                      child: const Text(AppStrings.closeSheetBtn),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _openModelRouterSheet() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
      ),
      builder: (BuildContext ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(AppStrings.modelRouterTitle,
                    style: AppTypography.title),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  AppStrings.autoFallbackEnabled,
                  style: AppTypography.monoCaption
                      .copyWith(color: AppColors.statusSuccess),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  AppStrings.onDeviceMaskingLabel,
                  style: AppTypography.monoCaption
                      .copyWith(color: AppColors.accentCyan),
                ),
                const SizedBox(height: AppSpacing.md),
                Wrap(
                  spacing: AppSpacing.sm,
                  children: <String>[
                    'gemini-2.5-flash',
                    'gemini-2.5-pro',
                    'deepseek-v3-fallback'
                  ].map((String m) {
                    final bool isSelected = _selectedModel == m;
                    return ChoiceChip(
                      label: Text(m, style: AppTypography.monoCaption),
                      selected: isSelected,
                      selectedColor: AppColors.accentPrimary,
                      backgroundColor: AppColors.bgElevated,
                      onSelected: (_) {
                        setState(() {
                          _selectedModel = m;
                        });
                        Navigator.of(ctx).pop();
                      },
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgSurface,
        elevation: 0,
        titleSpacing: AppSpacing.md,
        title: Row(
          children: <Widget>[
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.xs,
              ),
              decoration: BoxDecoration(
                color: AppColors.bgElevated,
                borderRadius: BorderRadius.circular(AppRadius.sm),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: const Text(
                '${AppStrings.memoryBankPrefix} (42)',
                style: AppTypography.monoCaption,
              ),
            ),
            const Expanded(
              child: Text(
                AppStrings.appTitle,
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.title,
              ),
            ),
            InkWell(
              key: const Key('model_router_button'),
              onTap: _openModelRouterSheet,
              borderRadius: BorderRadius.circular(AppRadius.full),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.bgElevated,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Text(
                  AppStrings.modelBadgeFlash,
                  style: AppTypography.monoCaption
                      .copyWith(color: AppColors.statusSuccess),
                ),
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: <Widget>[
          Expanded(
            child: ListView.separated(
              controller: _scrollController,
              padding: const EdgeInsets.all(AppSpacing.md),
              itemCount: _messages.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AppSpacing.md),
              itemBuilder: (BuildContext context, int index) {
                return _buildMessageItem(_messages[index]);
              },
            ),
          ),
          _buildQuickScenarioBar(),
          _buildMultimodalComposer(),
        ],
      ),
    );
  }

  Widget _buildMessageItem(ChatMessageModel msg) {
    if (msg.isUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 320),
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.accentPrimary,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              if (msg.imageName != null) ...<Widget>[
                Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.darkOverlay,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text('📷 ${msg.imageName}',
                          style: AppTypography.monoCaption
                              .copyWith(color: AppColors.white)),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        AppStrings.onDeviceMaskingLabel,
                        style: AppTypography.monoCaption.copyWith(
                            color: AppColors.accentCyan, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
              Text(msg.text, style: AppTypography.body),
            ],
          ),
        ),
      );
    }

    final bool isCollapsed = _collapsedThinkingIds.contains(msg.id);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          if (msg.thinking != null) ...<Widget>[
            InkWell(
              onTap: () {
                setState(() {
                  if (isCollapsed) {
                    _collapsedThinkingIds.remove(msg.id);
                  } else {
                    _collapsedThinkingIds.add(msg.id);
                  }
                });
              },
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.bgElevated,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            '${AppStrings.thinkingHeaderPrefix} (${msg.thinking!.durationMs}ms)',
                            style: AppTypography.monoCaption
                                .copyWith(color: AppColors.accentCyan),
                          ),
                        ),
                        Text(
                          isCollapsed
                              ? AppStrings.expandLabel
                              : AppStrings.collapseLabel,
                          style: AppTypography.monoCaption,
                        ),
                      ],
                    ),
                    if (!isCollapsed) ...<Widget>[
                      const SizedBox(height: AppSpacing.xs),
                      ...msg.thinking!.steps.map(
                        (ThinkingStepModel s) => Padding(
                          padding: const EdgeInsets.only(top: AppSpacing.xs),
                          child: Text(
                            '├─ ${s.label}: ${s.detail}',
                            style: AppTypography.monoCaption,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
          _buildCitedContent(msg),
          if (msg.uiCard != null) ...<Widget>[
            const SizedBox(height: AppSpacing.md),
            _buildGenerativeUiCard(msg.id, msg.uiCard!),
          ],
          if (msg.usage != null) ...<Widget>[
            const SizedBox(height: AppSpacing.md),
            Wrap(
              spacing: AppSpacing.md,
              runSpacing: AppSpacing.xs,
              children: <Widget>[
                Text(
                  '⚡ TTFT: ${msg.usage!.ttftMs}ms',
                  style: AppTypography.monoCaption
                      .copyWith(color: AppColors.textMuted),
                ),
                Text(
                  '📊 ${msg.usage!.totalTokens} Tokens (\$${msg.usage!.costUsd.toStringAsFixed(5)})',
                  style: AppTypography.monoCaption
                      .copyWith(color: AppColors.textMuted),
                ),
                Text(
                  'Model: ${msg.usage!.modelUsed}',
                  style: AppTypography.monoCaption
                      .copyWith(color: AppColors.accentCyan),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCitedContent(ChatMessageModel msg) {
    final CitationModel citation = msg.citations.isNotEmpty
        ? msg.citations.first
        : OmniBffService.defaultCitation;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(msg.text, style: AppTypography.body),
        if (msg.text.contains('[1]')) ...<Widget>[
          const SizedBox(height: AppSpacing.sm),
          InkWell(
            key: Key('citation_badge_${msg.id}'),
            onTap: () => _openCitationSheet(citation),
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.xs,
              ),
              decoration: BoxDecoration(
                color: AppColors.cyanTint,
                borderRadius: BorderRadius.circular(AppRadius.full),
                border: Border.all(color: AppColors.accentCyan),
              ),
              child: Text(
                '[1 ${AppStrings.citationPillSuffix}: ${citation.title}]',
                style: AppTypography.monoCaption
                    .copyWith(color: AppColors.accentCyan),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildGenerativeUiCard(String msgId, UiCardModel card) {
    if (card.cardType == 'tool_approval_card') {
      final Color borderColor = card.approvalStatus == ApprovalStatus.approved
          ? AppColors.statusSuccess
          : card.approvalStatus == ApprovalStatus.rejected
              ? AppColors.statusError
              : AppColors.statusWarning;

      final String badgeText = card.approvalStatus == ApprovalStatus.approved
          ? AppStrings.hitlApprovedBadge
          : card.approvalStatus == ApprovalStatus.rejected
              ? AppStrings.hitlRejectedBadge
              : AppStrings.hitlPendingBadge;

      return Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.bgElevated,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: borderColor, width: 1.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Expanded(
                  child: Text(
                    AppStrings.hitlCardTitle,
                    style: AppTypography.title.copyWith(color: borderColor),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.warningTint,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Text(
                    badgeText,
                    style:
                        AppTypography.monoCaption.copyWith(color: borderColor),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.bgPrimary,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(card.title, style: AppTypography.body),
                  const SizedBox(height: AppSpacing.xs),
                  Text(card.subtitle,
                      style: AppTypography.monoCaption
                          .copyWith(color: AppColors.accentCyan)),
                  const SizedBox(height: AppSpacing.xs),
                  Text(card.extraInfo,
                      style: AppTypography.monoCaption
                          .copyWith(color: AppColors.statusSuccess)),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            if (card.approvalStatus == ApprovalStatus.pending)
              Row(
                children: <Widget>[
                  Expanded(
                    child: OutlinedButton(
                      key: Key('reject_btn_$msgId'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.textPrimary,
                        side: const BorderSide(color: AppColors.borderSubtle),
                      ),
                      onPressed: () =>
                          _updateApprovalStatus(msgId, ApprovalStatus.rejected),
                      child: const Text(AppStrings.rejectActionBtn),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: ElevatedButton(
                      key: Key('approve_btn_$msgId'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentPrimary,
                        foregroundColor: AppColors.white,
                      ),
                      onPressed: () =>
                          _updateApprovalStatus(msgId, ApprovalStatus.approved),
                      child: const Text(AppStrings.approveActionBtn),
                    ),
                  ),
                ],
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: card.approvalStatus == ApprovalStatus.approved
                      ? AppColors.successTint
                      : AppColors.errorTint,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Text(
                  card.approvalStatus == ApprovalStatus.approved
                      ? AppStrings.approvedResultMsg
                      : AppStrings.rejectedResultMsg,
                  textAlign: TextAlign.center,
                  style: AppTypography.monoCaption.copyWith(color: borderColor),
                ),
              ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.bgElevated,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Expanded(
                child: Text(card.title, style: AppTypography.title),
              ),
              if (card.amount > 0)
                Text(
                  '¥${card.amount.toStringAsFixed(2)}',
                  style: AppTypography.headline
                      .copyWith(color: AppColors.statusSuccess),
                )
              else
                Text(
                  AppStrings.noConflictBadge,
                  style: AppTypography.monoCaption
                      .copyWith(color: AppColors.statusSuccess),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(card.subtitle, style: AppTypography.bodySecondary),
          const SizedBox(height: AppSpacing.xs),
          Text(card.extraInfo,
              style: AppTypography.monoCaption
                  .copyWith(color: AppColors.accentCyan)),
        ],
      ),
    );
  }

  Widget _buildQuickScenarioBar() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: const BoxDecoration(
        color: AppColors.bgPrimary,
        border: Border(top: BorderSide(color: AppColors.borderSubtle)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: <Widget>[
            _buildScenarioChip(
              key: const Key('chip_whiteboard'),
              label: AppStrings.quickWhiteboard,
              onTap: () => _sendPrompt(
                '帮我把白板上的架构评审时间加到日历，并查上周预算上限',
                scenarioHint: 'whiteboard_schedule',
                attachPhoto: true,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            _buildScenarioChip(
              key: const Key('chip_receipt'),
              label: AppStrings.quickReceipt,
              onTap: () => _sendPrompt(
                '帮我识别这张星巴克咖啡小票并归档记账',
                scenarioHint: 'receipt_expense',
                attachPhoto: true,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            _buildScenarioChip(
              key: const Key('chip_rag'),
              label: AppStrings.quickRag,
              onTap: () => _sendPrompt(
                '检索我上周拍的 Q4 AI 基建预算上限是多少',
                scenarioHint: 'rag_budget',
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            _buildScenarioChip(
              key: const Key('chip_analytics'),
              label: AppStrings.quickAnalytics,
              onTap: () => _sendPrompt(
                '统计汇总我 11 月份的消费分类占比',
                scenarioHint: 'monthly_analytics',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScenarioChip(
      {required Key key, required String label, required VoidCallback onTap}) {
    return InkWell(
      key: key,
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs,
        ),
        decoration: BoxDecoration(
          color: AppColors.bgSurface,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Text(label, style: AppTypography.monoCaption),
      ),
    );
  }

  Widget _buildMultimodalComposer() {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.sm),
        decoration: const BoxDecoration(
          color: AppColors.bgSurface,
          border: Border(top: BorderSide(color: AppColors.borderSubtle)),
        ),
        child: Row(
          children: <Widget>[
            IconButton(
              key: const Key('photo_attach_button'),
              tooltip: AppStrings.photoToggleTooltip,
              onPressed: () {
                setState(() {
                  _hasAttachedPhoto = !_hasAttachedPhoto;
                });
              },
              icon: Icon(
                Icons.camera_alt_outlined,
                color: _hasAttachedPhoto
                    ? AppColors.accentCyan
                    : AppColors.textSecondary,
              ),
            ),
            Expanded(
              child: TextField(
                key: const Key('chat_input_field'),
                controller: _inputController,
                style: AppTypography.body,
                decoration: InputDecoration(
                  hintText: AppStrings.inputHint,
                  hintStyle: AppTypography.monoCaption
                      .copyWith(color: AppColors.textMuted),
                  isDense: true,
                  filled: true,
                  fillColor: AppColors.bgPrimary,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: const BorderSide(color: AppColors.borderSubtle),
                  ),
                ),
                onSubmitted: (String value) => _sendPrompt(value),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            if (_isStreaming)
              ElevatedButton(
                key: const Key('stop_stream_button'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.statusError,
                  foregroundColor: AppColors.white,
                ),
                onPressed: _stopStreaming,
                child: const Text(AppStrings.stopBtn),
              )
            else
              ElevatedButton(
                key: const Key('send_prompt_button'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentPrimary,
                  foregroundColor: AppColors.white,
                ),
                onPressed: () => _sendPrompt(_inputController.text),
                child: const Text(AppStrings.sendBtn),
              ),
          ],
        ),
      ),
    );
  }
}
