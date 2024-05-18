import config from "../config.json";

export class StartOptions {
  foundryPath: string;
  dataPath: string;
  foundryVersion: string;

  constructor(foundryVersion: string) {
    this.foundryPath = config.foundryPath;
    this.dataPath = config.dataPath;
    this.foundryVersion = foundryVersion;
  }
}
