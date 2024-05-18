import { ListQuestion } from "inquirer";
import config from "../config.json";

/**
 * Prompt: What do you want to do?
 * Answer: whatToDo
 */
export function getStartingPrompt(): ListQuestion {
  const choices = [
    {
      name: "Start FounryVTT",
      value: "start-foundry",
    },
  ];
  if (config.modules?.length) {
    choices.push({
      name: "Select Modules",
      value: "select-modules",
    });
  }
  if (config.systems?.length) {
    choices.push({
      name: "Select System",
      value: "select-system",
    });
  }
  if (config.systems?.length || config.modules?.length) {
    choices.push({
      name: "Select System and Modules and start FoundryVTT",
      value: "start-foundry-and-select-everything",
    });
  }

  return {
    type: "list",
    name: "whatToDo",
    message: "Which system version do you want to use?",
    choices,
  };
}
