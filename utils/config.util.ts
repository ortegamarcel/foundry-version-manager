import config from "../config.json";
import { SystemConfig } from "../types/system-config.type";

export function getModuleConfigs(): SystemConfig[] {
  return config.modules ?? ([] as unknown as SystemConfig[]);
}

export function getSystemConfigs(): SystemConfig[] {
  return config.systems ?? ([] as unknown as SystemConfig[]);
}
