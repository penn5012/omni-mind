# `mobile-flutter` — OmniMind 跨端全模态移动客户端

- **技术栈**：Flutter 3.x (Dart 3) + Riverpod + Dio (自定义 SSE 客户端) + Google ML Kit + `device_calendar`
- **核心职责**：
  1. 单工作台流式对话 UI 与全局 Design Tokens (`AppColors`, `AppTypography`, `AppSpacing`, `AppRadius`)
  2. 4 类 Generative UI 原生动态交互卡片渲染（日程待办卡、消费记账卡、工具审批卡、统计图表卡）
  3. 点击 `[1][2]` 引用角标弹出半屏 RAG 记忆溯源抽屉 (`CitationSourceBottomSheet`)
  4. 相机拍照/语音采集、端侧 ML Kit 敏感词本地脱敏、审批通过后调用系统日历写入
