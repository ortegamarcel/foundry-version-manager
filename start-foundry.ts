import inquirer, { Question } from "inquirer";
import config from "./config.json";
import { StartOptions } from "./types/start-options.class";
import {
  getFoundryVersionPrompt,
  getSystemPrompt,
  getSystemVersionPrompt,
} from "./prompts";
import { applySystem, loadSystem, startFoundry } from "./commands";

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
