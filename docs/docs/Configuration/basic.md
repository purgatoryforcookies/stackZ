---
sidebar_position: 2
---

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

### Shell

stackZ supports the use of the following shells:

-   bash
-   zsh
-   powershell.exe
-   cmd.exe
-   wsl.exe

Shells are spawned as a logins shells in posix systems.
