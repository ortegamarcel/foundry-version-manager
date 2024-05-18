import inquirer, { Question } from "inquirer";
import config from "./config.json";
import { StartOptions } from "./types/start-options.class";
import {
  getFoundryVersionPrompt,
  getModuleVersionPrompt,
  getSystemPrompt,
  getSystemVersionPrompt,
} from "./prompts";
import { applySystem, loadSystem, startFoundry } from "./commands";
import { getModuleConfigs } from "./utils/config.util";
import { System, SystemType } from "./types/system.type";
import { log } from "./utils/logger.util";

let answers = {
  startFoundry: false,
  modules: [] as System[],
  foundryVersion: "",
  system: {} as System,
  systemName: "",
};

async function ask(question?: Question) {
  // Merge new answer into allAnswers
  const answer = await inquirer.prompt([question]);
  answers = Object.assign({}, answers, answer, {
    ...(answer.modules && { modules: [...answers.modules, answer.modules] }),
  });
}

async function run() {
  await ask(getFoundryVersionPrompt());
  if (config.systems?.length) {
    await ask(getSystemPrompt());
    await ask(getSystemVersionPrompt(answers.systemName));
  }
  if (config.modules?.length) {
    for (const module of getModuleConfigs()) {
      await ask(getModuleVersionPrompt(module));
    }
  }

  log();

  const systemPath = await loadSystem(answers.system, SystemType.SYSTEM);
  await applySystem(systemPath, answers.system, SystemType.SYSTEM);

  for (const module of answers.modules) {
    const modulePath = await loadSystem(module, SystemType.MODULE);
    await applySystem(modulePath, module, SystemType.MODULE);
  }

  const startOptions = new StartOptions(answers.foundryVersion);
  startFoundry(startOptions!);
}

run();
