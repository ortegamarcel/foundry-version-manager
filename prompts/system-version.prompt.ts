import { ListQuestion } from "inquirer";
import { System } from "../types/system.type";
import { logError } from "../utils/logger.util";
import { getSystemConfigs } from "../utils/config.util";

/** Returns a list of System for each configured version of it. */
function getSystemVersions(systemName: string): System[] {
  const system = getSystemConfigs().find(
    (system) => system.name === systemName
  );
  if (!system) {
    logError(
      "There is a problem with the script. Please create an issue under https://github.com/ortegamarcel/foundry-version-manager/issues."
    );
    process.exit(1);
  }
  return system.versions.map(
    (version) =>
      ({
        name: systemName,
        version: version.name,
        url: version.url,
      } as System)
  );
}

/**
 * Prompt: Which system version do you want to use?
 * Answer: system
 */
export function getSystemVersionPrompt(systemName: string): ListQuestion {
  const systemVersions = getSystemVersions(systemName);
  return {
    type: "list",
    name: "system",
    message: "Which system version do you want to use?",
    choices: systemVersions.map((systemVersion) => ({
      name: systemVersion.version,
      value: systemVersion,
    })),
  };
}
