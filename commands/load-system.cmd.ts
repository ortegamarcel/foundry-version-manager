import axios from "axios";
import * as fs from "fs-extra";
import * as path from "path";
import AdmZip from "adm-zip";
import { System, SystemType } from "../types/system.type";
import {
  getFolderName,
  getFolderNameFromUrl,
} from "../utils/get-folder-name.util";
import { logError, logInfo } from "../utils/logger.util";

/** Loads the system/module from the cache. Downloads it first if it doesn't exist. */
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

  const name = `"${system.name} - ${system.version}"`;

  try {
    logInfo(`Checking cache for ${name}...`);
    if (!(await fs.pathExists(cacheDir))) {
      // Ensure the cache directory exists
      logInfo(`Preparing cache for ${name}...`);
      await fs.ensureDir(cacheDir);

      // Download the systems zip file
      logInfo(
        `Downloading ${systemType.toLowerCase()} zip file from ${system.url}...`
      );
      const loadingAnimation = setInterval(
        () => logInfo(`Still downloading...`),
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
      logInfo(`Saving ${name}...`);
      await fs.writeFile(zipFilePath, response.data);

      // Extract the zip file to a temporary directory
      logInfo(`Extracting ${name}...`);
      const tempExtractDir = path.join(cacheDir, "temp");
      await fs.ensureDir(tempExtractDir);
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(tempExtractDir, true);

      // Find the systemContent directory containing system.json/module.json
      logInfo(`Updating cache for ${name}...`);
      const systemJsonPath = await findSystemJson(tempExtractDir, systemType);
      const systemContentDir = path.dirname(systemJsonPath);

      // Move systemContent to the final cache directory
      await fs.copy(systemContentDir, cacheDir);

      // Remove the temporary directory and the zip file after extraction
      await fs.remove(tempExtractDir);
      await fs.remove(zipFilePath);
    } else {
      logInfo(`Loaded ${name} from cache.`);
    }
  } catch (error) {
    logError(`Error downloading and extracting ${name}`);
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
