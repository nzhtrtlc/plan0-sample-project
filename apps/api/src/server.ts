import "dotenv/config";
import app from "./app";
import { logger } from "@packages/utils";

const port = Number(process.env.PORT) || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`[Server] Starting in CWD: ${process.cwd()}`);
  logger.info(`Backend running on http://localhost:${port}`);
});
