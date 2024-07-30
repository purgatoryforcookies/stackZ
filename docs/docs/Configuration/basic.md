---
sidebar_position: 2
---


import newIcon from '../../static/img/newon1_3_0.png';

# Basic settings

The main configuring blocks for stacks and terminals are:

-   Current working directories: the path where command is executed in
-   Environment variables
-   Shell

Since you can configure these in both levels - the terminal takes the priority.

To copy an existing terminal with its settings to another stack, you can do so by right clicking a command from your palette and choosing "copy to".

:::tip
You can mix and match differrent shells and paths in your stack's terminals.
:::

### Current working directories

Setting cwd's for stack is required for enabling the github widget. The widget will look for git project only in the stacks default cwd.

Terminal cwd has no effect on github widget.

### Environment variables 


Each stack and each terminal can have 1 or more environment variable sets.

Stack variables are applied to all terminals within the stack.

You can have multiple env sets which all are baked into one once the terminal is started, together with your host machines variables. Multiple environment sets are applied from left to right which means variables with same keys get overwritten with the next one.

Environments and their key-value pairs can be muted for temporarily ignoring it from the session.


### Environment editor and remote environments

<div style={{width: '100%'}}> <img src={newIcon} alt="Diagram" style={{width: 80}} /></div>

Environment editor lets you easily configure your variables, in a similar manner you would make an .env-file.
Editor brings you key completion and linting, which not only makes the variable declaration faster, it also aims to reduce the possibility of typos in the keys. With code styling, the key-value pairs are easy to read.

Editor provides suggestions for common keys used in AWS CLI and from your OS environment. It also suggests keys you have used in other stacks and terminals.

#### Remote environments

Remote environments are environments that are hosted in somewhere else than stackZ. This can be either a file or a service. You can let stackZ keep these variables in sync automatically, this means every remote set is refreshed before a terminal is run. This behaviour is toggleable and you can opt out of it. 

You may also set stackZ to make a local copy of the variables (offline-mode) in the stacks.json -file, in case your remote becomes unavailable.

stackZ offer you suggestions for .env files it can find based on your terminals cwd. You're free to provide a file path of your own too. 
Suggestions include AWS Secrets manager.

The command works as a normal terminal command which outputs either text or a json-object. [./jq](https://jqlang.github.io/jq/) provides an easy to use json formatting tool which, if installed in your system, works in stackZ too. All the commands are run in the user's shell context.

:::tip
If your secret manager charges you for each request you make, not using the automatic sync might be a good idea. This depends on your use case.
:::

:::warning
If you keep a remote environment in offline -mode, varibales of the set will be written plaintext in stacks.json
:::

### Shell

stackZ supports the use of the following shells:

-   bash
-   zsh
-   powershell.exe
-   cmd.exe
-   wsl.exe

Shells are spawned as a logins shells in posix systems.
