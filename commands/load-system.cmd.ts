import fs from "fs-extra";
import { logError, logInfo, logSuccess } from "../utils/logger.util";
import path from "path";
import axios from "axios";
import {
  getFolderName,
  getFolderNameFromUrl,
} from "../utils/get-folder-name.util";
import { System } from "../types/system.type";
import AdmZip from "adm-zip";

/**
 * Downloads a system, caches it and returns the path to the folder.
 * Only downloads the system, if it is not already cached.
 * @param zipUrl The URL to the projects zip file
 * @returns path to the systems folder
 */
export async function loadSystem(system: System): Promise<string> {
  const systemFolderName = getFolderName(system.name);
  const versionFolderName = getFolderNameFromUrl(system.url);

  const cacheDir = path.join(
    process.cwd(),
    ".cache",
    "systems",
    systemFolderName,
    versionFolderName
  );

  try {
    logInfo("Checking cache...");
    if (!(await fs.pathExists(cacheDir))) {
      // Ensure the cache directory exists
      logInfo("Preparing cache...");
      await fs.ensureDir(cacheDir);

      // Download the systems zip file
      logInfo("Downloading system zip file...");
      const loadingAnimation = setInterval(
        () => logInfo("Still downloading..."),
        5000
      );
      const response = await axios.get(system.url, {
        responseType: "arraybuffer",
      });
      clearInterval(loadingAnimation);

      // Define the path for the downloaded zip file
      const zipFilePath = path.join(cacheDir, "system.zip");

      // Save the downloaded zip file to the file system
      logInfo("Saving system zip file...");
      await fs.writeFile(zipFilePath, response.data);

      // Extract the zip file
      logInfo("Extracting system zip file...");
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(cacheDir, true);

      // Remove the zip file after extraction
      logInfo("Deleting system zip file...");
      await fs.remove(zipFilePath);

      logSuccess(`System downloaded and cached successfully.`);
    } else {
      logSuccess("Loaded system from cache.");
    }
  } catch (error) {
    logError("Error downloading and extracting the system");
    throw error;
  }

  return cacheDir;
}
