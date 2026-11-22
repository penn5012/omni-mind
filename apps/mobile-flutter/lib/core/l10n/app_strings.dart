class AppStrings {
  AppStrings._();

  static const String appTitle = '✦ OmniMind';
  static const String memoryBankPrefix = '☰ 记忆库';
  static const String modelBadgeFlash = '● Gemini 2.5 ▾';
  static const String modelRouterTitle = '⚙️ 多模型路由网关与端云协同配置';
  static const String autoFallbackEnabled =
      'Auto-Fallback 已开启 (Gemini ➔ DeepSeek-V3)';
  static const String onDeviceMaskingLabel = '🛡️ 端侧 ML Kit 已自动脱敏 1 处手机号';

  static const String quickWhiteboard = '📸 拍白板提取日程审批';
  static const String quickReceipt = '🧾 拍星巴克小票记账卡';
  static const String quickRag = '🔍 检索 Q4 预算记忆 [1]';
  static const String quickAnalytics = '📊 11 月消费分类图表卡';

  static const String inputHint = '输入指令，或点击快捷胶囊...';
  static const String stopBtn = '停止';
  static const String sendBtn = '发送';
  static const String photoToggleTooltip = '附带拍照图片';

  static const String thinkingHeaderPrefix = '💭 思考与工具规划完成';
  static const String expandLabel = '展开 ▾';
  static const String collapseLabel = '收起 ▴';

  static const String citationPillSuffix = '溯源';
  static const String citationSheetTitle = '🔍 RAG 记忆溯源详情';
  static const String closeSheetBtn = '关闭溯源抽屉';
  static const String origPhotoThumbLabel = '原图缩略图';

  static const String hitlCardTitle = '⚠️ 端侧系统日历写入审批';
  static const String hitlPendingBadge = '挂起待确认';
  static const String hitlApprovedBadge = '✓ 已写入';
  static const String hitlRejectedBadge = '✕ 已拒绝';
  static const String approveActionBtn = '✓ 批准写入日历';
  static const String rejectActionBtn = '✕ 拒绝';
  static const String approvedResultMsg =
      '✓ 已调用 device_calendar 写入成功 (event_id: cal_9821)';
  static const String rejectedResultMsg = '✕ 已拒绝执行该敏感写操作并通知云端 Agent';

  static const String expenseCardTitle = '🧾 智能消费记账识别卡';
  static const String scheduleCardTitle = '📅 智能日程待办提取卡';
  static const String noConflictBadge = '🟢 无日程冲突';
}
