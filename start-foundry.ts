import inquirer, { ListQuestion, Question } from "inquirer";
import { ChildProcess, ExecException, exec } from "child_process";
import fs from "fs-extra";
import config from "./config.json";
import axios from "axios";
import path from "path";
import AdmZip from "adm-zip";
import { StartOptions } from "./types/start-options.class";
import { System } from "./types/system.type";
import { SystemConfig } from "./types/system-config.type";

// Keywords used for semantic coloring. Used by `registerChildProcess()`.
let successKeywords: string[] = [];
let warningKeywords: string[] = [];

const Color = {
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Default: "\x1b[0m",
};

const CANCEL_CHOICE = {
  name: "Cancel",
  value: "cancel",
};

function logSuccess(msg: string) {
  log(msg, Color.Green);
}

function logError(msg: string) {
  log(msg, Color.Red);
}

function logWarning(msg: string) {
  log(msg, Color.Yellow);
}

function logInfo(msg: string) {
  log(msg, Color.Blue);
}

function log(msg = "", color = Color.Default) {
  console.log(`${color}${msg}${Color.Default}`);
}

/** A wrapper function for exec with default error handling and increased buffer size. */
function execute(command: string): ChildProcess {
  return exec(command, (err: ExecException | null) => {
    if (err) throw err;
  });
}

/**
 * Registers a child process and maps its output to the console.
 * @param process The child process
 * @param name A name for the child process.
 * If defined, it will show up above each process message so the user can see where the message is coming from. Also applies some semantic coloring.
 * If undefined the raw child process output will be mapped.
 * Should be defined, when many child processes will be started.
 */
function registerChildProcess(process: ChildProcess, name?: string) {
  process.on("error", (error: string) => {
    if (name) {
      console.error(`${Color.Red}[${name}] error${Color.Default}`);
      console.error(`${Color.Red}Failed to start subprocess.${Color.Default}`);
      console.error(`${Color.Red}${error}${Color.Default}`);
    } else {
      console.log(error);
    }
  });

  process.stdout?.on("data", (data: string) => {
    if (data.trim()) {
      if (name) {
        console.log(`${Color.Blue}[${name}] log${Color.Default}`);
      }
      console.log(data);
    }
  });

  process.stderr?.on("data", (data: string) => {
    if (data.trim()) {
      if (name) {
        const isSuccess = successKeywords.some((keyword) =>
          data.includes(keyword)
        );
        let color = Color.Green;
        let messageType = "success";
        if (!isSuccess) {
          const isWarning = warningKeywords.some((keyword) =>
            data.includes(keyword)
          );
          color = isWarning ? Color.Yellow : Color.Red;
          messageType = isWarning ? "warning" : "error";
        }
        console.error(`${color}[${name}] ${messageType}${Color.Default}`);
        console.error(`${color}${data}${Color.Default}`);
      } else {
        console.log(data);
      }
    }
  });

  process.on("close", (code: number) => {
    if (name) {
      console.log(`${Color.Blue}[${name}] log${Color.Default}`);
    }
    console.log(
      code === 0
        ? `${Color.Green}Successful${Color.Default}\n`
        : `${Color.Red}child process exited with code ${code}${Color.Default}`
    );
  });
}

function getFoundryVersions(): string[] {
  try {
    return fs
      .readdirSync(config.foundryPath)
      .filter((folder: string) => folder.startsWith("v"));
  } catch (err) {
    throw new Error(
      `Could not find any foundryvtt options under '${config.foundryPath}'`
    );
  }
}

/**
 * Prompt: Which FoundryVTT version do you want to start?
 * Answer: foundryVersion
 */
function getFoundryVersionPrompt(): ListQuestion {
  const foundryVersions = getFoundryVersions();
  return {
    type: "list",
    name: "foundryVersion",
    message: "Which Foundry version do you want to start?",
    choices: foundryVersions,
  };
}

function getSystemConfigs(): SystemConfig[] {
  return config.systems ?? ([] as unknown as SystemConfig[]);
}

/** Returns the names of all configured systems. */
function getSystems(): string[] {
  return getSystemConfigs().map((system) => system.name);
}

/**
 * Prompt: Which system do you want to use?
 * Answer: systemName
 */
function getSystemPrompt(): ListQuestion {
  const systems = getSystems();
  return {
    type: "list",
    name: "systemName",
    message: "Which system do you want to use?",
    choices: [...systems, CANCEL_CHOICE],
  };
}

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
function getSystemVersionPrompt(systemName: string): ListQuestion {
  const systemVersions = getSystemVersions(systemName);
  return {
    type: "list",
    name: "system",
    message: "Which system version do you want to use?",
    choices: [
      ...systemVersions.map((systemVersion) => ({
        name: systemVersion.version,
        value: systemVersion,
      })),
      CANCEL_CHOICE,
    ],
  };
}

/**
 * Creates a folder name out of a url by removing the domain and protocol
 * and replacing "/" with "_" and other special characters with "-".
 */
function getFolderNameFromUrl(url: string): string {
  return url
    .split("://")
    .slice(1) // remove protocol
    .join("")
    .split("/")
    .slice(1) // remove domain
    .join("_") // replace "/" with "_"
    .replace(/[^a-zA-Z0-9_-]/g, "-"); // Replace all other special characters with "-"
}

/** Replaces all characters of `str` that are not a letter, number or "_" with "-". */
function getFolderName(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, "-");
}

/**
 * Downloads a system, caches it and returns the path to the folder.
 * Only downloads the system, if it is not already cached.
 * @param zipUrl The URL to the projects zip file
 * @returns path to the systems folder
 */
async function loadSystem(system: System): Promise<string> {
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

async function applySystem(systemPath: string): Promise<void> {
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

async function startFoundry(startOptions: StartOptions): Promise<void> {
  logInfo("Starting Foundry...");
  log();
  const startFoundryCmd = execute(
    `node ${startOptions.foundryPath}/${startOptions.foundryVersion}/resources/app/main.js --dataPath=${startOptions.dataPath}`
  );
  registerChildProcess(startFoundryCmd);
}

let foundryVersion: string;

async function run(question?: Question) {
  if (!question) {
    question = getFoundryVersionPrompt();
  }
  const answer = await inquirer.prompt([question]);

  if (Object.values(answer)[0] === "cancel") {
    run(getFoundryVersionPrompt());
    return;
  }

  // Handle Prompt 1: Which foundry version do you want to start?
  if (answer.foundryVersion) {
    foundryVersion = answer.foundryVersion;
    if (config.systems?.length) {
      run(getSystemPrompt());
    } else {
      const startOptions = new StartOptions(foundryVersion);
      startFoundry(startOptions!);
    }
  }

  // Handle Prompt 2: Which system do you want to start?
  if (answer.systemName) {
    run(getSystemVersionPrompt(answer.systemName));
  }

  // Handle Prompt 3: Which system version do you want to start?
  if (answer.system) {
    const systemPath = await loadSystem(answer.system);
    await applySystem(systemPath);
    const startOptions = new StartOptions(foundryVersion);
    startFoundry(startOptions!);
  }
}

run();
