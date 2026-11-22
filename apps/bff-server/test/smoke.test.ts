import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

test('SMK-BFF-01: GET /api/health returns online status and multi-model router config', async () => {
  const res = await app.request('/api/health');
  assert.equal(res.status, 200);
  const data = (await res.json()) as { status: string; memoryCount: number; models: unknown[] };
  assert.equal(data.status, 'ok');
  assert.equal(data.memoryCount, 42);
  assert.equal(data.models.length, 3);
});

test('SMK-BFF-02: POST /api/chat/stream streams multi-channel SSE events (thinking -> citations -> text_delta -> ui_card -> usage_metrics)', async () => {
  const res = await app.request('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: '帮我把白板上的架构评审时间加到手机日历，并查一下上周定的预算上限',
      modelId: 'gemini-2.5-flash',
      scenarioHint: 'whiteboard_schedule',
    }),
  });

  assert.equal(res.status, 200);
  assert.ok(res.headers.get('content-type')?.includes('text/event-stream'));

  const text = await res.text();
  assert.ok(text.includes('event: thinking'), 'Should emit thinking event');
  assert.ok(text.includes('event: citations'), 'Should emit citations event');
  assert.ok(text.includes('event: text_delta'), 'Should emit text_delta event');
  assert.ok(text.includes('event: ui_card'), 'Should emit ui_card event');
  assert.ok(text.includes('tool_approval_card'), 'Should include tool_approval_card payload');
  assert.ok(text.includes('event: usage_metrics'), 'Should emit usage_metrics event');
});

test('SMK-BFF-03: POST /api/chat/approve handles Human-in-the-Loop approval and rejection', async () => {
  const res = await app.request('/api/chat/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cardId: 'card_hitl_9821',
      toolName: 'device_calendar.create_event',
      approved: true,
    }),
  });

  assert.equal(res.status, 200);
  const data = (await res.json()) as { ok: boolean; status: string; eventId: string };
  assert.equal(data.ok, true);
  assert.equal(data.status, 'approved');
  assert.equal(data.eventId, 'cal_9821');
});
