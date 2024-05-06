---
sidebar_position: 3
---

# Advanced settings

To make stackZ useful for differrent use cases: there are many differrent ways to change its behaviour.
Most of the settings take effect only when terminal is run in a stack. 


### Stack mode

:::note
Each stacks execution order is guaranteed. You can change this by dragging terminals up and down. 
:::

#### Healthchecks and delays

Healthchecks and delays are meant for delaying the start of a terminal until it is needed.

The use case is for e.g. you're spawning a server which connects to a database and the database needs to be up and running before the server.

Command you set for the check is run on 1 second intervals until the command returns exit code 0. All other exit codes are read as a failing healthcheck. After 240 attempts, the terminal starts regardless. 

If a delay is specified, the delay is waited **before** healthcheck starts. 


#### Halt

Halting a terminal means the stack waits for a terminal to exit before continuing the sequence to a next terminal. If a terminal never exits, the stack will never start the next terminal.


### Other settings

Loose terminal does not stop until it is stopped by you. Without this, the terminal stops once the code exits. 

If rerun on exit is set, the terminal will always start again once it either exits or is stopped.

Sending CTRL-C on exit is a feature to stop any other services you might be runnning withing your terminal session. For e.g. docker containers. If terminal process is exited with default SIGHUP (on posix machines), the docker container keeps running in the background. 


### Sequencing (in beta)

In efforts to make running more complicated (and repetitve) tasks easy, stackZ offers a feature for sequencing user inputs to the terminal sessions. 

It works by recording when the terminal session requires user input and then providing configurable interace for setting these inputs for later runs.

You can set each step in a sequence to be either a string or a command of which output is then used as an input. This is particularly useful when working with sensitive data and you want to retrieve secret values from for e.g. vaults, programmatically. 

Start by enabling the feature, and then run the terminal process once. After, come back to the settings and fill in the values for the steps. 


The following rules apply:
- Empty field is considered as empty input, and continued with Enter
- Input can be a string or a command which outputs a string
- Each keystroke during the initial setup-run is registered as a user input step in the sequence.


