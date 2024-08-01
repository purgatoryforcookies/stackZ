---
sidebar_position: 3
---

# Advanced settings

To make stackZ useful for differrent use cases: there are many differrent ways to change its behaviour.
Most of the settings take effect only when terminal is run in a stack.

### Stack mode

:::note
Each stacks execution order is guaranteed.
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

### Sequencing

In efforts to make running more complicated (and repetitive) tasks easy, stackZ offers a feature for sequencing user inputs to the terminal sessions. It is little similar to **[Linux yes(1)](https://man7.org/linux/man-pages/man1/yes.1.html)**, but with added control.

It works by recording places where you type into the session and then provides configurable interface for setting these values for later runs.

Set up each step in a sequence with a command. This command is run on your host machine's context and whatever it outputs is then fed into the running terminal and executed. 
This is particularly useful when working with sensitive data and you want to retrieve secret values from for e.g. vaults, programmatically.


:::tip
Marking your step as a secret, prevents it from being printed in the console.
:::

The following rules apply:

-   Empty field is considered as empty input, and continued with Enter
-   Input is a command which outputs a string. Output is used as an input to the terminal process.
-   Inputs are run with the same shell as is set up in the terminal. No other settings are passed to it (variables, cwd). It runs in the context of your host machine.
-   Each time you type into an active terminal run, the index of it is registered as a step. (this makes sense to you once you finish your setup and go fill in the steps in the settings)

:::tip
Echo's output is a string, and you can use this to directly run commands in the terminal.

In windows `echo "command"`

In posix `echo command`

:::

Currently there is no way of removing a step from a sequence once it is registered. If you think you made an error while setting up the sequencer, you can start over by unchecking the setting.
