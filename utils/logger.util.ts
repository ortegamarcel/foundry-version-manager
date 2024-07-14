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
  if (msg) {
    console.log(`[${getCurrentDateTime()}] ${color}${msg}${Color.Default}`);
  } else {
    console.log();
  }
}

function getCurrentDateTime(): string {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formattedParts = new Intl.DateTimeFormat(
    "en-GB",
    options
  ).formatToParts(date);

  const formatMap: { [key: string]: string } = {};
  formattedParts.forEach(({ type, value }) => {
    formatMap[type] = value;
  });

  return `${formatMap["year"]}-${formatMap["month"]}-${formatMap["day"]} ${formatMap["hour"]}:${formatMap["minute"]}:${formatMap["second"]}`;
}
