import Fastify from "fastify";
import { syncInstruments } from "./instruments/sync.js";

const APP_VERSION = process.env.APP_VERSION ?? "0.0.1";
const PORT = Number(process.env.MD_COLLECTOR_PORT ?? 3003);
const HOST = process.env.HOST ?? "0.0.0.0";
const SYNC_ON_BOOT = process.env.INSTRUMENTS_SYNC_ON_BOOT === "true";
const SYNC_INTERVAL_MIN = Number(process.env.INSTRUMENTS_SYNC_INTERVAL_MIN || 0);

export async function buildServer() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({
    status: "ok",
    service: "md-collector",
    version: APP_VERSION,
    ts: Date.now(),
  }));

  app.get("/ready", async () => ({
    ready: true,
    service: "md-collector",
  }));

  // --- Admin: instrument sync ---
  app.post("/admin/instruments/sync", async (_req, reply) => {
    const result = await syncInstruments();
    reply.status(result.ok ? 200 : 500).send(result);
  });

  return app;
}

export async function start() {
  const app = await buildServer();
  await app.listen({ port: PORT, host: HOST });

  app.log.info({
    event: "service_start",
    service: "md-collector",
    version: APP_VERSION,
    port: PORT,
  });

  // Auto-sync on boot
  if (SYNC_ON_BOOT) {
    syncInstruments().catch((err) => {
      app.log.error({ event: "boot_sync_error", error: String(err) });
    });
  }

  // Periodic sync
  if (SYNC_INTERVAL_MIN > 0) {
    setInterval(
      () => {
        syncInstruments().catch((err) => {
          app.log.error({ event: "periodic_sync_error", error: String(err) });
        });
      },
      SYNC_INTERVAL_MIN * 60 * 1000,
    );
  }
}
