import Fastify from "fastify";

const APP_VERSION = process.env.APP_VERSION ?? "0.0.1";
const PORT = Number(process.env.API_SERVICE_PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";

export async function buildServer() {
  const app = Fastify({ logger: true });

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

  // --- Stub endpoints (logic in later phases) ---

  app.get("/subscriptions", async () => ({
    subscriptions: [],
  }));

  app.get("/snapshots", async () => ({
    snapshots: [],
  }));

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
