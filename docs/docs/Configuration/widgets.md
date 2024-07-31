---
sidebar_position: 5
---

# Widgets

Two widgets has been built to support the goal of stackZ - speed up your workflow.

## Github

Github widget allows you to swithc branches quickly from a dropdown menu. Each branch from both local and remote are listed.

Choosing a branch performs `git checkout <branch>`. If you choose branches from origin, the checkout is made to local.

Refreshing the list performs `git pull`.

You can safely use the widget. It does not do commits for you. If you've set any global configs for pulling branches (rebase, merge, ff), they will be performed.

Prerequisites: Stacks default cwd needs to be set for the widget to know its home.

Common errors:

-   You're refreshing the list or changing branches while having uncommitted changes
-   Stack cwd is not set

## Docker

Docker widget lists all the containers you have and their current state. You can start and stop containers, and see some additional information about them in the tooltip. Containers are also searchable from the CMD+K menu.

Right-clicking tooltip card's file icon copies the file location of the docker-compose.yaml file (if it exists).

Left-clicking tooltip card's file icon opens the directory where containers docker-compose.yaml file is (if it exists).

Removing a container kills it, removes it (by force), and deletes any anonymous volumes attatched to it.

Prerequisites: Have the docker daemon exposed. Please read more about this [Docker docs](https://docs.docker.com/config/daemon/remote-access/)

Common errors:

-   You don't have the daemon exposed
