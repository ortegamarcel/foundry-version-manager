import axios from "axios";
import * as fs from "fs-extra";
import * as path from "path";
import AdmZip from "adm-zip";
import { System, SystemType } from "../types/system.type";
import {
  getFolderName,
  getFolderNameFromUrl,
} from "../utils/get-folder-name.util";
import { logError, logInfo, logSuccess } from "../utils/logger.util";

export async function loadSystem(
  system: System,
  systemType: SystemType
): Promise<string> {
  const systemFolderName = getFolderName(system.name);
  const versionFolderName = getFolderNameFromUrl(system.url);

  const cacheDir = path.join(
    process.cwd(),
    ".cache",
    systemType === SystemType.SYSTEM ? "systems" : "modules",
    systemFolderName,
    versionFolderName
  );

  const prefix = `[${system.name} - ${system.version}]`;

  try {
    logInfo(`${prefix} Checking cache...`);
    if (!(await fs.pathExists(cacheDir))) {
      // Ensure the cache directory exists
      logInfo(`${prefix} Preparing cache...`);
      await fs.ensureDir(cacheDir);

      // Download the systems zip file
      logInfo(`${prefix} Downloading ${systemType.toLowerCase()} zip file...`);
      const loadingAnimation = setInterval(
        () => logInfo(`${prefix} Still downloading...`),
        2500
      );
      const response = await axios.get(system.url, {
        responseType: "arraybuffer",
      });
      clearInterval(loadingAnimation);

      // Define the path for the downloaded zip file
      const zipFilePath = path.join(
        cacheDir,
        `${systemType.toLowerCase()}.zip`
      );

      // Save the downloaded zip file to the file system/module
      logInfo(`${prefix} Saving ${systemType.toLowerCase()} zip file...`);
      await fs.writeFile(zipFilePath, response.data);

      // Extract the zip file to a temporary directory
      logInfo(`${prefix} Extracting ${systemType.toLowerCase()} zip file...`);
      const tempExtractDir = path.join(cacheDir, "temp");
      await fs.ensureDir(tempExtractDir);
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(tempExtractDir, true);

      // Find the systemContent directory containing system.json/module.json
      const systemJsonPath = await findSystemJson(tempExtractDir, systemType);
      const systemContentDir = path.dirname(systemJsonPath);

      // Move systemContent to the final cache directory
      await fs.copy(systemContentDir, cacheDir);

      // Remove the temporary directory and the zip file after extraction
      await fs.remove(tempExtractDir);
      await fs.remove(zipFilePath);

      logSuccess(
        `${prefix} ${systemType.toLowerCase()} downloaded and cached successfully.`
      );
    } else {
      logSuccess(`${prefix} Loaded ${systemType.toLowerCase()} from cache.`);
    }
  } catch (error) {
    logError(
      `${prefix} Error downloading and extracting the ${systemType.toLowerCase()}`
    );
    throw error;
  }

  return cacheDir;
}

async function findSystemJson(
  dir: string,
  systemType: SystemType
): Promise<string> {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      try {
        return await findSystemJson(fullPath, systemType);
      } catch (err) {
        // Ignore and continue searching
      }
    } else if (file === `${systemType.toLowerCase()}.json`) {
      return fullPath;
    }
  }
  throw new Error(`${systemType.toLowerCase()}.json not found in ${dir}`);
}
