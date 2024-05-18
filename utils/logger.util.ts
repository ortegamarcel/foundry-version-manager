import { Color } from "./color.util";

export function logSuccess(msg: string) {
  log(msg, Color.Green);
}

export function logError(msg: string) {
  log(msg, Color.Red);
}

export function logWarning(msg: string) {
  log(msg, Color.Yellow);
}

export function logInfo(msg: string) {
  log(msg, Color.Default);
}

export function log(msg = "", color = Color.Default) {
  console.log(`${color}${msg}${Color.Default}`);
}
