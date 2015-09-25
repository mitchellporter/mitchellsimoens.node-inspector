(function () {
    "use strict";

    var spawn = require('child_process').spawn,
        child, _domainManager;

    function isRunning() {
        return !!child;
    }

    function killInspector() {
        if (child) {
            child.kill();
            child = null;
        }

        return true;
    }

    function startInspector(cwd, isWin, shell) {
        var cmd  = 'node-inspector',
            args = isWin ? ['/c', cmd] : ['-c', cmd];

        child = spawn(
            shell,
            args,
            {
                cwd : cwd,
                env : process.env
            }
        );

        child.on('close', function() {
            if (child) {
                child.kill();

                child = null;
            }
        });

        return true;
    }

    function init(domainManager) {
        if (!domainManager.hasDomain('nodeinspector')) {
            domainManager.registerDomain(
                'nodeinspector',
                {
                    major : 0,
                    minor : 1
                }
            );
        }

        domainManager.registerCommand(
            'nodeinspector',
            'isRunning',
            isRunning,
            false,
            'Check to see if a node-inspector process is running.',
            [],
            [
                {
                    name        : 'running',
                    type        : 'boolean',
                    description : 'node-inspector process found'
                }
            ]
        );

        domainManager.registerCommand(
            'nodeinspector',
            'killInspector',
            killInspector,
            false,
            'Kill all node-inspector running processes.',
            [],
            [
                {
                    name        : 'running',
                    type        : 'boolean',
                    description : 'node-inspector processes killed'
                }
            ]
        );

        domainManager.registerCommand(
            'nodeinspector',
            'startInspector',
            startInspector,
            false,
            'Start a node-inspector process.',
            [
                {
                    name        : 'cwd',
                    type        : 'string',
                    description : 'Path to the node-inspector executable'
                },
                {
                    name        : 'isWin',
                    type        : 'boolean',
                    description : 'Whether platform is windows or not'
                },
                {
                    name        : 'shell',
                    type        : 'string',
                    description : 'Shell command'
                }
            ],
            [
                {
                    name        : 'running',
                    type        : 'boolean',
                    description : 'node-inspector process started'
                }
            ]
        );

        _domainManager = domainManager;
    }

    exports.init = init;

}());
