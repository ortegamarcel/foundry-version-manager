import { log } from "console";
import { StartOptions } from "../types/start-options.class";
import { logInfo } from "../utils/logger.util";
import { execute } from "../utils/execute.util";
import { registerChildProcess } from "../utils/register-child-process.util";

export async function startFoundry(startOptions: StartOptions): Promise<void> {
  logInfo("Starting Foundry...");
  log();
  const startFoundryCmd = execute(
    `node ${startOptions.foundryPath}/${startOptions.foundryVersion}/resources/app/main.js --dataPath=${startOptions.dataPath}`
  );
  registerChildProcess(startFoundryCmd);
}
