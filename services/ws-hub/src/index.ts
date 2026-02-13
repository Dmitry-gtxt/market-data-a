import { start } from "./server.js";

start().catch((err) => {
  console.error({ event: "fatal", service: "ws-hub", error: String(err) });
  process.exit(1);
});
