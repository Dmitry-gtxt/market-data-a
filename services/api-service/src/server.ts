import Fastify from "fastify";
import { SCHEMA_VERSION } from "@market-data/shared";

const APP_VERSION = process.env.APP_VERSION ?? "0.0.1";
const PORT = Number(process.env.API_SERVICE_PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export async function buildServer() {
  const app = Fastify({ logger: true });

  // --- CORS ---
  app.addHook("onRequest", async (req, reply) => {
    const origin = req.headers.origin;
    if (origin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      reply.header("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") {
      reply.status(204).send();
    }
  });

  // --- Health / Ready ---

  app.get("/health", async () => ({
    status: "ok",
    service: "api-service",
    version: APP_VERSION,
    ts: Date.now(),
  }));

  app.get("/ready", async () => ({
    ready: true,
    service: "api-service",
  }));

  // --- Symbols ---
  // P04: stub returning empty array. Real DB query in P05.
  app.get("/symbols", async () => ({
    schema_version: SCHEMA_VERSION,
    symbols: [],
  }));

  // --- Markets ---
  app.get("/markets", async () => ({
    schema_version: SCHEMA_VERSION,
    markets: [],
  }));

  // --- Subscriptions (stub) ---
  app.get("/subscriptions", async () => ({
    subscriptions: [],
  }));

  // --- Snapshots (stub) ---
  app.get("/snapshots", async () => ({
    snapshots: [],
  }));

  // --- Replay (stub) ---
  app.post("/replay", async (_req, reply) => {
    reply.status(501).send({
      error: "Not Implemented",
      message: "Replay will be implemented in a future phase.",
    });
  });

  return app;
}

export async function start() {
  const app = await buildServer();
  await app.listen({ port: PORT, host: HOST });

  app.log.info({
    event: "service_start",
    service: "api-service",
    version: APP_VERSION,
    port: PORT,
  });
}
