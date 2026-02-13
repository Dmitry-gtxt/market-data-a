import { start } from "./server.js";

start().catch((err) => {
  console.error({ event: "fatal", service: "api-service", error: String(err) });
  process.exit(1);
});
