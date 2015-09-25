mitchellsimoens.node-inspector
===

The purpose of this Brackets extension is to allow a simple button to start/stop node-inspector.

When node-inspector is off (no processes running it), the icon will be gray. If it is running, it will be green. To start/stop node-inspector, all that is needed is to click on the button.

On first click, it will ask for the path to node-inspector. This is because the node process running behind Brackets is **NOT** run under the user and therefore does not know how you have your user setup in the operating system and it's environment variables.

You do need node-inspector installed globally:

    npm install -g node-inspector

Development
===

This extension does require the ps-node module. This needes to be installed in the `node/node_modules/` directory.
