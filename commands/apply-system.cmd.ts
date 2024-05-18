import path from "path";
import { logError, logInfo } from "../utils/logger.util";
import config from "../config.json";
import fs from "fs-extra";
import { System, SystemType } from "../types/system.type";

/**
 * Copies the system/module to the foundry data folder.
 * @param systemPath The local path to the system folder
 * @param system only used to log more info
 * @param systemType if it is a system or module
 */
export async function applySystem(
  systemPath: string,
  system: System,
  systemType: SystemType
): Promise<void> {
  const prefix = `[${system.name} - ${system.version}]`;

  try {
    const systemJsonPath = path.join(
      systemPath,
      `${systemType.toLowerCase()}.json`
    );

    logInfo(`${prefix} Loading ${systemType.toLowerCase()} id...`);

    // Check if system.json/module.json file exists
    if (!(await fs.pathExists(systemJsonPath))) {
      logError(`${prefix} Could not load ${systemType.toLowerCase()} id`);
      return;
    }

    // Read the system.json/module.json file
    const systemData = await fs.readJson(systemJsonPath);

    // Extract the target folder name from the id property
    const targetFolderName = systemData.id;

    // Define the target path based on the systemPath's folder name
    const targetFolderPath = path.join(
      config.dataPath,
      "Data",
      systemType === SystemType.SYSTEM ? "systems" : "modules",
      targetFolderName
    );

    // Check if the target folder already exists and delete it if it does
    logInfo(`${prefix} Checking if old ${systemType.toLowerCase()} exists...`);
    if (await fs.pathExists(targetFolderPath)) {
      logInfo(`${prefix} Deleting old ${systemType.toLowerCase()}...`);
      await fs.remove(targetFolderPath);
    }

    // Copy the folder from systemPath to the target folder
    logInfo(`${prefix} Applying new ${systemType.toLowerCase()}...`);
    await fs.copy(systemPath, targetFolderPath);
  } catch (error) {
    logError(`${prefix} Error applying ${systemType.toLowerCase()}`);
    throw error;
  }
}
