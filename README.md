# Foundry Version Manager

With this tool you can easily start foundry with any system-module-foundry-version-combination you want.

For Example: When you are developing own modules and want to check if it is compatible with different foundry and game system versions. Or want to check different behaviour on your latest development branch or the latest release.

Works on Linux and Windows.

# Setup

1. Clone this project
2. Run `npm i` inside the projects root folder

# Manage different FoundryVTT versions

1. Create a folder for your foundryvtt programs. I.e. `/home/myname/foundryvtt`
2. For each FoundryVTT version you want to install create a folder there, which begings with 'v'. I.e. `v11.315`
3. Install the appropriate version inside the version folder
4. Open the `config.json` file and enter the path to your foundry versions. I.e. `/home/myname/foundryvtt`

To can download Foundry as zip file from the website (under your personal dashboard). Then simply unpack it inside the version folder.

# Manage different System versions

You can specify different systems and versions in the config file. This is useful, when there are many forks of the same system. For example:

```json
{
  "foundryPath": "/home/user/foundryvtt",
  "dataPath": "/home/user/foundrydata/dev",
  "systems": [
    {
      "name": "The Witcher TRPG",
      "versions": [
        {
          "name": "latest (by ortegamarcel)",
          "url": "https://github.com/ortegamarcel/TheWitcherTRPG/releases/latest/download/system.zip"
        },
        {
          "name": "latest (by AnthonyMonette)",
          "url": "https://github.com/AnthonyMonette/TheWitcherTRPG/releases/latest/download/system.zip"
        },
        {
          "name": "latest (by Stexinator)",
          "url": "https://github.com/Stexinator/TheWitcherTRPG/releases/latest/download/system.zip"
        }
      ]
    }
  ]
}
```

# Manage different module versions

You can specify different modules and versions in the config file. This is useful, when there are many forks, releases or branches of the same module that you want to test. For example:

```json
{
  "foundryPath": "/home/user/foundryvtt",
  "dataPath": "/home/user/foundrydata/dev",
  "systems": [],
  "modules": [
    {
      "name": "Token Action HUD - TheWitcherTRPG",
      "versions": [
        {
          "name": "development",
          "url": "https://github.com/ortegamarcel/fvtt-token-action-hud-thewitchertrpg/archive/refs/heads/main.zip"
        },
        {
          "name": "latest release",
          "url": "https://github.com/ortegamarcel/fvtt-token-action-hud-thewitchertrpg/releases/latest/download/module.zip"
        }
      ]
    },
    {
      "name": "Gwent - The Dice Game",
      "versions": [
        {
          "name": "development",
          "url": "https://github.com/ortegamarcel/fvtt-gwent/archive/refs/heads/main.zip"
        },
        {
          "name": "latest release",
          "url": "https://github.com/ortegamarcel/fvtt-gwent/releases/latest/download/module.zip"
        }
      ]
    }
  ]
}
```

# Don't forget dependencies

Dependencies of both systems and modules are not automatically installed and should therefore also be configured.

# Don't forget to enable modules

This script only downloads and installs modules (and systems) but does not enable them for your world. You still need to do that manually.

# Run FoundryVTT

Run `npm start` inside the root folder and follow the instructions.
