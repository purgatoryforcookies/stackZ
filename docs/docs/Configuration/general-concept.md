---
sidebar_position: 1
---

# General concept

Backbone of stackZ is the stacks.json file. Everything important is configured in it.
You can share your stack with your team or backup it and transfer it to another workstation.

You can use the terminals spawned from stackZ in the same way you would your normal terminals.

There are 2 ways of building your stack:

-   Within the app itself or
-   Manually editing the json

:::tip
Need to change paths for all terminals? Edit the stacks.json directly.
:::

:::warning
Everything you see in stackZ is saved in plaintext locally in the stacks.json-file. Bare this in mind when working with sensitive data.
:::

## Your stack

Each terminal belongs to a stack. You can have multiple stacks and multiple terminals.

Terminals can be started individually or as a stack. There is no limit on how many of these you can make, or start at once.

import Diag1 from '../../static/img/diag1.png';

<div class="text--center"> 
<img src={Diag1} alt="Diagram" style={{width: 500, filter:'brightness(1.8)'}} />
</div>
