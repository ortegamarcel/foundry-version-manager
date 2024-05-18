import { ListQuestion } from "inquirer";
import { CANCEL_CHOICE } from "./cancel-choice";
import { getSystemConfigs } from "../utils/config.util";

/** Returns the names of all configured systems. */
function getSystems(): string[] {
  return getSystemConfigs().map((system) => system.name);
}

/**
 * Prompt: Which system do you want to use?
 * Answer: systemName
 */
export function getSystemPrompt(): ListQuestion {
  const systems = getSystems();
  return {
    type: "list",
    name: "systemName",
    message: "Which system do you want to use?",
    choices: [...systems, CANCEL_CHOICE],
  };
}
