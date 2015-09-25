define(function(require, exports, module) {
    var ExtensionUtils     = brackets.getModule('utils/ExtensionUtils'),
        FileSystem         = brackets.getModule('filesystem/FileSystem'),
        NodeDomain         = brackets.getModule('utils/NodeDomain'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        ProjectManager     = brackets.getModule('project/ProjectManager'),
        prefs              = PreferencesManager.getExtensionPrefs('mitchellsimoens.node-inspector'),
        inspectorDomain    = new NodeDomain('nodeinspector', ExtensionUtils.getModulePath(module, 'node/NodeInspectorDomain')),
        inspectorRunning   = false,
        isWin              = brackets.platform === 'win',
        shell              = isWin ? 'cmd.exe' : '/bin/bash',
        icon;

    prefs.definePreference('path', 'string', '');

    ExtensionUtils.loadStyleSheet(module, 'resources/main.css');

    function isRunning() {
        icon.addClass('running');
    }

    function notRunning() {
        icon.removeClass('running');
    }

    function checkRunning() {
        inspectorDomain
            .exec('isRunning')
            .done(function(running) {
                if (running) {
                    isRunning();
                } else {
                    notRunning();
                }

                inspectorRunning = running;
            })
            .fail(function(error) {
                console.error('[mitchellsimoens.node-inspector] failed to run nodeinspector.isRunning', error);
            });
    }

    function killInspector() {
        inspectorDomain
            .exec('killInspector')
            .done(function(success) {
                inspectorRunning = false;

                notRunning();
            })
            .fail(function(error) {
                console.error('[mitchellsimoens.node-inspector] failed to run nodeinspector.killInspector', error);
            });
    }

    function startInspector() {
        var path = prefs.get('path');

        if (!path) {
            alert('Please choose a patch to the node-inspector executable, this will be saved');

            FileSystem.showOpenDialog(
                false,
                true,
                'Select a new path to node-inspector',
                null,
                null,
                function(error, dir) {
                    if (!error && dir.length > 0) {
                        dir = dir[0];

                        if (dir) {
                            if (dir.substr(-1) !== '/') {
                                dir += '/';
                            }

                            prefs.set('path', dir);
                        }
                    }

                    startInspector();
                }
            );

            return;
        }

        inspectorDomain
            .exec('startInspector', path, isWin, shell)
            .done(function(success) {
                inspectorRunning = success;

                isRunning();
            })
            .fail(function(error) {
                console.error('[mitchellsimoens.node-inspector] failed to run nodeinspector.startInspector', error);
            });
    }

    setInterval(checkRunning, 1000);

    checkRunning();

    ProjectManager.on('beforeAppClose', killInspector);

    icon = $('<a>')
        .attr({
            id    : 'node-inspector-icon',
            href  : '#',
            title : 'node-inspector'
        })
        .click(function() {
            if (inspectorRunning) {
                killInspector();
            } else {
                startInspector();
            }
        })
        .appendTo($('#main-toolbar .buttons'));
});
