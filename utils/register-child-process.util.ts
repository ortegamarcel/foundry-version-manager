import { ChildProcess } from "child_process";
import { Color } from "./color.util";

// Keywords used for semantic coloring. Used by `registerChildProcess()`.
let successKeywords: string[] = [];
let warningKeywords: string[] = [];

/**
 * Registers a child process and maps its output to the console.
 * @param process The child process
 * @param name A name for the child process.
 * If defined, it will show up above each process message so the user can see where the message is coming from. Also applies some semantic coloring.
 * If undefined the raw child process output will be mapped.
 * Should be defined, when many child processes will be started.
 */
export function registerChildProcess(process: ChildProcess, name?: string) {
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
