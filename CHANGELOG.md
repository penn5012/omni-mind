# Changelog

All notable changes to the **OmniMind (`penn5012/omni-mind`)** full-stack AI project are documented in this file.

## [v2026.11.22] - 2026-11-22 (Milestone 1 `v0.1.0` Baseline)

### ✨ Added
- **Shared Schema (`packages/shared-schema`)**:
  - Defined strong Zod schemas for multi-channel SSE streaming events (`thinking`, `citations`, `text_delta`, `ui_card`, `usage_metrics`) and 4 Generative UI cards (`tool_approval_card`, `expense_card`, `schedule_card`, `analytics_card`).
- **AI BFF Server (`apps/bff-server`)**:
  - Built TypeScript + Hono server (`http://localhost:3001`) with `@google/genai` integration and multi-model auto-fallback router (`gemini-2.5-flash` ➔ `gemini-2.5-pro` ➔ `deepseek-v3-fallback`).
  - Implemented `GET /api/health`, `GET /api/memories`, `POST /api/chat/stream` (`streamSSE`), and `POST /api/chat/approve` (Human-in-the-Loop approval endpoint).
  - Added automated Node smoke test suite (`SMK-BFF-01 ~ SMK-BFF-03`).
- **Web Console (`apps/web-console`)**:
  - Initialized React 19 + TypeScript + Vite workbench (`http://localhost:3000`) with full SSE streaming, `AbortController` manual stop, RAG `[1]` citation drawer, and 4 Generative UI cards.
- **Flutter Mobile Client (`apps/mobile-flutter`)**:
  - Initialized Flutter 3.x cross-platform app (`com.omnimind.omnimind_mobile`).
  - Mapped all UI styling strictly to `AppColors`, `AppTypography`, `AppSpacing`, `AppRadius` (`lib/core/theme/app_tokens.dart`) and centralized strings in `AppStrings` (`lib/core/l10n/app_strings.dart`).
  - Implemented single-workbench multimodal stream UI, collapsible thinking chain, clickable `[1]` RAG Citation BottomSheet, Human-in-the-Loop approval cards, and model router settings sheet.
  - Added and passed 100% of blocking smoke widget tests (`SMK-01 ~ SMK-05`), including multi-resolution (`360x640` & `393x852`) zero-overflow verification.
