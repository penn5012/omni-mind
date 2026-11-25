# Changelog

All notable changes to the **OmniMind (`penn5012/omni-mind`)** full-stack AI project are documented in this file.

## [v2026.11.25] - 2026-11-25 (Migrate Mobile Client from Flutter to React + Ant Design H5)

### ✨ Added
- **Mobile H5 Client (`apps/mobile-h5`)**:
  - Replaced Flutter native app with a zero-native-setup Mobile H5 web application (`@omnimind/mobile-h5`, port `3002`, `--host` enabled for LAN phone preview) built with **React 19 + TypeScript + Ant Design 5 + Vite 6**.
  - Implemented mobile-first viewport (`100dvh`, `safe-area-inset-*`), `480px` desktop shell framing, horizontally scrollable quick-scenario pill bar, and bottom `Drawer` sheets for RAG Citation (`[1]`), Personal Memory Bank, and Multi-Model Router configuration.
  - Added H5 browser-native capabilities: HTML5 camera/photo upload (`capture="environment"`) with Canvas compression, client-side regex privacy masking (phone / ID numbers), Web Speech API voice input, and `.ics` calendar export for Human-in-the-Loop schedule approval.

### 🗑️ Removed
- Removed `apps/mobile-flutter` and Flutter/Android-specific ignore rules to unify the entire Monorepo on **TypeScript + React + Ant Design**.

### 📝 Changed
- Updated `pnpm-workspace.yaml`, root `package.json` (`dev:h5`, `build`), `LEARNING_PLAN.md`, `README.md`, and `docs/01~04` to reflect the unified **TypeScript + React + Ant Design (Web & H5)** architecture.

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
