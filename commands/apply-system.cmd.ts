import path from "path";
import { logError, logInfo, logSuccess } from "../utils/logger.util";
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
  const name = `"${system.name} - ${system.version}"`;

  try {
    const systemJsonPath = path.join(
      systemPath,
      `${systemType.toLowerCase()}.json`
    );

    logInfo(`Loading ${systemType.toLowerCase()} id of ${name}...`);

    // Check if system.json/module.json file exists
    if (!(await fs.pathExists(systemJsonPath))) {
      logError(
        `${name} Could not load ${systemType.toLowerCase()} id of ${name}`
      );
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
    logInfo(`Checking for old copy of ${name}...`);
    if (await fs.pathExists(targetFolderPath)) {
      logInfo(`Deleting old copy of ${name}...`);
      await fs.remove(targetFolderPath);
    }

    // Copy the folder from systemPath to the target folder
    logInfo(`Applying ${name}...`);
    await fs.copy(systemPath, targetFolderPath);
    logSuccess(
      `${name}-${systemType.toLowerCase()} downloaded, cached and applied successfully.`
    );
  } catch (error) {
    logError(`Error applying ${name}`);
    throw error;
  }
}
