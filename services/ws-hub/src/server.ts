import Fastify from "fastify";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "node:crypto";

const APP_VERSION = process.env.APP_VERSION ?? "0.0.1";
const PORT = Number(process.env.WS_HUB_PORT ?? 3002);
const HOST = process.env.HOST ?? "0.0.0.0";

export async function start() {
  const app = Fastify({ logger: true });

  // --- Health / Ready (HTTP) ---

  app.get("/health", async () => ({
    status: "ok",
    service: "ws-hub",
    version: APP_VERSION,
    ts: Date.now(),
  }));

  app.get("/ready", async () => ({
    ready: true,
    service: "ws-hub",
  }));

  // Start HTTP server
  await app.listen({ port: PORT, host: HOST });

  // --- WebSocket server on same port ---

  const wss = new WebSocketServer({
    server: app.server,
    path: "/ws",
  });

  wss.on("connection", (ws: WebSocket) => {
    app.log.info({ event: "ws_client_connected", service: "ws-hub" });

    // Send hello envelope
    const hello = {
      exchange: "system",
      market_type: "system",
      symbol_raw: "",
      symbol_norm: "",
      channel: "system",
      ts_exchange: 0,
      ts_recv: Date.now(),
      seq: null,
      event_id: randomUUID(),
      schema_version: 1,
      payload: {
        type: "hello",
        version: APP_VERSION,
        message: "Connected to ws-hub",
      },
    };

    ws.send(JSON.stringify(hello));

    ws.on("close", () => {
      app.log.info({ event: "ws_client_disconnected", service: "ws-hub" });
    });
  });

  app.log.info({
    event: "service_start",
    service: "ws-hub",
    version: APP_VERSION,
    port: PORT,
    note: "SINGLE REPLICA — do not scale horizontally",
  });
}
