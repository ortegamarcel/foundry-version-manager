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
import { getStartingPrompt } from "./prompts/starting.prompt";

let answers = {
  whatToDo: "",
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
  await ask(getStartingPrompt());
  if (answers.whatToDo.startsWith("start-foundry")) {
    await ask(getFoundryVersionPrompt());
  }
  if (
    (answers.whatToDo === "select-system" ||
      answers.whatToDo === "start-foundry-and-select-everything") &&
    config.systems?.length
  ) {
    await ask(getSystemPrompt());
    await ask(getSystemVersionPrompt(answers.systemName));
  }
  if (
    (answers.whatToDo === "select-modules" ||
      answers.whatToDo === "start-foundry-and-select-everything") &&
    config.modules?.length
  ) {
    for (const module of getModuleConfigs()) {
      await ask(getModuleVersionPrompt(module));
    }
  }

  log();

  if (answers.whatToDo === "select-system") {
    await selectSystem();
  } else if (answers.whatToDo === "select-modules") {
    await selectModules();
  } else if (answers.whatToDo === "start-foundry-and-select-everything") {
    if (config.systems?.length) {
      await selectSystem();
    }
    if (config.modules?.length) {
      await selectModules();
    }
    runFoundry();
  } else {
    runFoundry();
  }
}

async function selectSystem() {
  const systemPath = await loadSystem(answers.system, SystemType.SYSTEM);
  await applySystem(systemPath, answers.system, SystemType.SYSTEM);
}

async function selectModules() {
  for (const module of answers.modules) {
    const modulePath = await loadSystem(module, SystemType.MODULE);
    await applySystem(modulePath, module, SystemType.MODULE);
  }
}

async function runFoundry() {
  const startOptions = new StartOptions(answers.foundryVersion);
  startFoundry(startOptions!);
}

run();
