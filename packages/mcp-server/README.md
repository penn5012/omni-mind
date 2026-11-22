# `@omnimind/mcp-server` — 自定义 MCP (Model Context Protocol) 服务端

- **技术栈**：TypeScript + `@modelcontextprotocol/sdk` + Zod
- **核心职责**：
  1. 封装标准化 MCP Tools（待办与日程查询、网页正文提取、个人记忆库检索、汇率/天气查询）
  2. 支持 Stdio 与 Streamable HTTP 传输协议，供 `apps/bff-server` 或 Claude Desktop / Cursor 动态挂载调用
