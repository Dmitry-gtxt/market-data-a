import Fastify from "fastify";

const APP_VERSION = process.env.APP_VERSION ?? "0.0.1";
const PORT = Number(process.env.MD_COLLECTOR_PORT ?? 3003);
const HOST = process.env.HOST ?? "0.0.0.0";

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
}
