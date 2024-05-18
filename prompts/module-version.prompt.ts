import { ListQuestion } from "inquirer";
import { SystemConfig } from "../types/system-config.type";
import { System } from "../types/system.type";
import { getModuleConfigs } from "../utils/config.util";
import { logError } from "../utils/logger.util";

/** Returns a list of `System` for each configured module version. */
function getModuleVersions(moduleName: string): System[] {
  const system = getModuleConfigs().find(
    (module) => module.name === moduleName
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
        name: moduleName,
        version: version.name,
        url: version.url,
      } as System)
  );
}

/**
 * Prompt: Which module version do you want to use?
 * Answer: modules
 */
export function getModuleVersionPrompt(module: SystemConfig): ListQuestion {
  const versions = getModuleVersions(module.name);
  return {
    type: "list",
    name: "modules",
    message: `Which version of "${module.name}" do you want to use?`,
    choices: versions.map((moduleVersion) => ({
      name: moduleVersion.version,
      value: moduleVersion,
    })),
  };
}
