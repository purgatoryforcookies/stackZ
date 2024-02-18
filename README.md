
# StackZ

Are you struggling to keep up how did that one of your dozen projects started up again? Was this project configurable with .env-file, or did I use EXPORT's in the beginning of commands? What differrent services needs to be up?
I must have written it out in somewhere... I hope. 

StackZ is a developer tool which purpose is to answer above mentioned questions. Most of them atleast. 

With StackZ, you can create environments and pipelines withing your development machine. Each stack is easily configurable with environment variables, which get injected into the running terminal. You can have multiple env-sets for each terminal, and they can be muted individually for quick adjustments, e.g. either dev, test or production enviroment. CWD's (current working directories) can be speficied within each terminal.

Each terminal in a stack can be run as a sequence, or separetly. In a sequence, the order or the terminal spawns is quaranteed, and you can set delays for terminal to slow down their startup. Delaying takes effect only when you start the stack. Running a single terminal from a stack does not obey the delay. 

Terminals can be set to restart on error, or to run as a loose terminal. Loose terminal does not listen for exists. Session remains open and does not stop until you stop it. Rerun will trigger terminal restart always, even if you stop the terminal yourself. This functionality enables for quick restarts of the terminal. 

StackZ supports the following shells:

- Powershell
- CommandPrompt
- WSL.exe
- Bash
- Zsh

Zsh and bash shells run as a login shell. As each terminal's cwd can be changed, this also applies to WSL's directories. You can run a mix of Linux based projects running on WSL, and windows based projects for example. 

StackZ has few hotkeys, which toggle additional features. The most import one is CMD+K (CTRL+K). It opens a quick navigation where you can search everything and see the other hotkeys used in the app. You'll come around disabled buttons and fields, they are placeholders for future use. 

You'll be naming things through out creating stacks and terminals. For terminals, you'll give each terminal notes. There you can add additional description about what the terminal does. These descriptions help you to both search the terminals from CMD+K menu, and to describe the purpose of the terminal for future you. 

The stacks and terminals are saved and read from a json-file. You can build your setup in the application, and by modifying the json file directly. Modifying the json-file gives you speed. You can backup your setup by taking a copy of your json-file. This enables also the ability to share the stacks with your teammates. 



## Features

- Run terminals in a pipeline
- Mac and windows support (linux too but might be lacking)
- Sequence runs and add delays
- Search with CMD+K menu
- Configure environment sets, and mute/edit them
- Backup, edit and share your stacks directly in the json-file
- Themes (only dark ones)
- Combine with for e.g. taskfiles or shell scripts to complicate things up



## Usage/Examples

### 


## Instructions

### Environments

Each environment has priority and you'll read them from left to right. 

On the very left, you'll have OS Environments which get inherited from your machine. They are applied first. One by one to the right. If you have KEY's with the same name, they will get overwritten.

You can mute a single ENV by right-clicking it, or a complete set from the toolbar. Muted variables are ignored. In order to edit the list, you'll need to be in edit mode. 

### Terminals

When terminal is stopped you can change its settings by typing commands. 

`cd new/path/` will change the currenct working directory (cwd) of the terminal. Directory changes inside a running terminal are ignored. 
`shell terminal` will change the terminal used. This can be for e.g.

- bin/bash or bash (default)
- bin/zsh or zsh
- powershell.exe (default)
- cmd.exe
- wsl.exe
- You can try any terminal you want, the support might be limited to running loose terminals only though

`just type some command` changes the command to be executed once terminal is started. Can also be a squence or point to a file. Commands inside a running terminal are ignored.

When you stop a terminal, it stops with SIGHUP (on Linux and Mac).
You can also exit terminal process with typing CTRL+C in most cases. 

Any commands typed inside a running terminal session are ignored by the terminals settings. For e.g. cwd changes do not get picked up. 

### Stacks

If you start the stack, it runs in order from top to bottom. Each terminal can be delayed from its dropdown menu. Delays are only respected when starting the stack. 

Loose terminals dont listen for exits and has to be stopped manually.

Terminals can restart on exits.
