(function () {
    "use strict";

    var ps    = require('ps-node'),
        spawn = require('child_process').spawn,
        child, _domainManager;

    function isRunning(callback) {
        ps.lookup(
            {
                command   : 'node',
                arguments : /node-inspector/
            },
            function(error, processes) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, !!child || (processes && processes.length > 0));
                }
            }
        );
    }

    function killInspector(callback) {
        if (child) {
            child.kill();
            child = null;
        }

        ps.lookup(
            {
                command   : 'node',
                arguments : /node-inspector/
            },
            function(error, processes) {
                if (error) {
                    callback(error);
                } else if (processes && processes.length) {
                    var killed = 0;

                    processes.forEach(function(process) {
                        ps.kill(process.pid, function(error) {
                            killed++;

                            if (error) {
                                callback(error);
                            } else if (processes.length === killed) {
                                callback(null, true);
                            }
                        });
                    });
                } else {
                    callback(null, true);
                }
            }
        );
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
            true,
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
            true,
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
