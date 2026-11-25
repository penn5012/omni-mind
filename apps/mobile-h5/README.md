# `@omnimind/mobile-h5` — 移动端 H5 全模态 AI 助手（React 19 + Ant Design 5）

替代原 Flutter App，免除原生环境配置成本，直接通过浏览器/手机 PWA 访问，复用 Monorepo 共享协议 `@omnimind/shared-schema` 与后端 `@omnimind/bff-server`。

## 核心技术栈
- **框架与 UI**：React 19 + TypeScript + Ant Design 5 (`antd` + `@ant-design/icons` + `ConfigProvider` Design Tokens) + Vite 6
- **移动 H5 专项适配**：
  - `100dvh` 视口高度与 `env(safe-area-inset-*)` 刘海屏/底部手势条安全区适配
  - 手机端全屏满宽 + 桌面浏览器 `480px` 居中移动外壳预览，360px 小屏零横向溢出
  - HTML5 相机拍照/相册选图（`capture="environment"`）+ 前端 Canvas 压缩预览
  - 浏览器本地正则隐私脱敏（手机号 / 身份证号上传前本地掩码）
  - Web Speech API 语音转文字输入（不支持的浏览器自动友好降级提示）
  - 一键生成标准 `.ics` 日程文件并唤起手机系统日历导入

## 快速启动

```bash
# 在仓库根目录安装依赖
pnpm install

# 启动后端 BFF (端口 3001)
pnpm dev:bff

# 启动移动 H5 工作台 (端口 3002，已开启 --host 支持同局域网手机真机扫码/IP 访问)
pnpm dev:h5
```
