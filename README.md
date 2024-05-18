# Foundry Version Manager

A tool to manage different foundry and system versions. Useful for development.

> Disclaimer: I use Linux for development. Nonetheless, I try to make it work on Windows as well, but there is no guarantee that it will work. When there are any problems, you can create an Issue.

# Setup

1. Clone this project
2. Run `npm i` inside the projects root folder

# Manage different FoundryVTT versions

1. Create a folder for your foundryvtt programs. I.e. `/home/myname/foundryvtt`
2. For each FoundryVTT version you want to install create a folder there, which begings with 'v'. I.e. `v11.315`
3. Install the appropriate version inside the version folder
4. Open the `config.json` file and enter the path to your foundry versions. I.e. `/home/myname/foundryvtt`

To can download Foundry as zip file from the website (under your personal dashboard). Then simply unpack it inside the version folder.

# Run FoundryVTT

Run `npm start` inside the root folder and follow the instructions.
