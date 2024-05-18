import fs from "fs-extra";
import config from "../config.json";
import { ListQuestion } from "inquirer";

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
export function getFoundryVersionPrompt(): ListQuestion {
  const foundryVersions = getFoundryVersions();
  return {
    type: "list",
    name: "foundryVersion",
    message: "Which Foundry version do you want to start?",
    choices: foundryVersions,
  };
}
