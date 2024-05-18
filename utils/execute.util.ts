import { ChildProcess, ExecException, exec } from "child_process";

/** A wrapper function for exec with default error handling and increased buffer size. */
export function execute(command: string): ChildProcess {
  return exec(command, (err: ExecException | null) => {
    if (err) throw err;
  });
}
