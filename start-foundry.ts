import inquirer, { ListQuestion, Question } from "inquirer";
import { ChildProcess, ExecException, exec } from "child_process";
import fs from "fs";
import config from "./config.json";

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
 * Answer: nxAdapter
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

class StartOptions {
  foundryPath: string;
  foundryVersion?: string;

  constructor() {
    this.foundryPath = config.foundryPath;
  }
}

function startFoundry(startOptions: StartOptions) {
  const startFoundryCmd = execute(
    `node ${startOptions.foundryPath}/${startOptions.foundryVersion}/resources/app/main.js --dataPath=$HOME/foundrydata`
  );
  registerChildProcess(startFoundryCmd);
}

async function run(question?: Question) {
  if (!question) {
    question = getFoundryVersionPrompt();
  }
  const answer = await inquirer.prompt([question]);
  const startOptions = new StartOptions();

  if (Object.values(answer)[0] === "cancel") {
    run(getFoundryVersionPrompt());
    return;
  }

  // Handle Prompt 1: Which foundry version do you want to start?

  if (answer.foundryVersion) {
    startOptions.foundryVersion = answer.foundryVersion;
    startFoundry(startOptions);
  }
}

run();
