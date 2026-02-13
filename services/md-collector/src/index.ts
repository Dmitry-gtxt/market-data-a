import { start } from "./server.js";

start().catch((err) => {
  console.error({ event: "fatal", service: "md-collector", error: String(err) });
  process.exit(1);
});
