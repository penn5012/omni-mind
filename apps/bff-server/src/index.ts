import { serve } from '@hono/node-server';
import { app } from './app.js';

const port = Number(process.env.PORT ?? 3001);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`✦ OmniMind AI BFF Server running at http://localhost:${info.port}`);
    console.log(`  ├─ Health Check: http://localhost:${info.port}/api/health`);
    console.log(`  ├─ Multi-Channel SSE: POST http://localhost:${info.port}/api/chat/stream`);
    console.log(`  └─ HITL Tool Approval: POST http://localhost:${info.port}/api/chat/approve`);
  }
);
