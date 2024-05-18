import path from "path";
import { logError, logInfo } from "../utils/logger.util";
import config from "../config.json";
import fs from "fs-extra";

export async function applySystem(systemPath: string): Promise<void> {
  try {
    const systemJsonPath = path.join(systemPath, "system.json");

    logInfo("Loading system id...");

    // Check if system.json file exists
    if (!(await fs.pathExists(systemJsonPath))) {
      logError("Could not load system id");
      process.exit(1);
    }

    // Read the system.json file
    const systemData = await fs.readJson(systemJsonPath);

    // Extract the target folder name from the id property
    const targetFolderName = systemData.id;

    // Define the target path based on the systemPath's folder name
    const targetFolderPath = path.join(
      config.dataPath,
      "Data/systems",
      targetFolderName
    );

    // Check if the target folder already exists and delete it if it does
    logInfo("Checking if old system exists...");
    if (await fs.pathExists(targetFolderPath)) {
      logInfo(`Deleting old system...`);
      await fs.remove(targetFolderPath);
    }

    // Copy the folder from systemPath to the target folder
    logInfo("Applying new system...");
    await fs.copy(systemPath, targetFolderPath);
  } catch (error) {
    logError("Error applying system");
    throw error;
  }
}
