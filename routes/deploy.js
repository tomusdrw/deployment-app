var fs = require('fs');
var ansi2html = require('ansi2html');
var mkdirp = require('mkdirp');

var commandId = 0;
var runCommands = function(commands, cwd, callback) {
    var spawn = require('child_process').spawn;
    console.log("[] Working dir: " + cwd);
    console.log("[" + commandId + "] Running commands: ", commands);
    commandId++;

    var bash = spawn('bash', ['-c', commands.join(" && ")], {
        cwd: cwd
    });
    bash.on('error', function(data) {
        callback(data);
    });
    bash.stderr.setEncoding('utf8');
    bash.stderr.on('data', function(data) {
        console.error(data);
    });
    bash.on('close', function(code) {
        console.warn("Command " + commandId + " finished with status: " + code);
    });
    // Return right away
    callback(false);
};


var echoCmd = function(msg) {
    return "echo '======================= " + msg + " ======================='";
};

var config = require('../config');

var getLogFile = function(server) {
    var date = new Date();

    var z = function(v) {
        if (v < 10) {
            return "0" + v;
        }
        return "" + v;
    };

    var dateFile =
        z(date.getMonth() + 1) + "." +
        z(date.getDate()) + "-" +
        z(date.getHours()) + "." +
        z(date.getMinutes()) + "." +
        z(date.getSeconds());


    return config.logsPath + dateFile + "-" + server.name + "-" + date.getMilliseconds();
};

var deploy = function(config, env, callback) {
    var logFile = getLogFile(env);

    var Commands = {
        _commandsList: [],
        addBash: function(cmd, description) {
            if (description) {
                this._commandsList.push(echoCmd(description));
            }
            this._commandsList.push("echo \"" + cmd + "\"");
            this._commandsList.push(cmd);
        }
    };

    config(Commands, env);

    var toRun = Commands._commandsList.map(function(cmd) {
        return cmd + " >> " + logFile;
    });

    toRun.unshift("touch " + logFile);

    runCommands(toRun, env.path, callback);

};


exports.defaultServer = function(req, res) {
    deploy(config.deploy, config.defaultEnv, function(err) {
        if (err) {
            res.send(500, err);
        } else {
            res.send(200);
        }
    });
};

exports.deploy = function(req, res) {
    var env = config.environments[req.params.serverName];

    if (env) {
        deploy(config.deploy, env, function(err) {
            if (err) {
                res.send(500, err);
            } else {
                res.send(200);
            }
        });
    } else {
        console.log("Server not found:" + req.params.serverName);
        res.send(404);
    }
};


exports.logsList = function(req, res) {
    mkdirp(config.logsPath, function(err) {
        fs.readdir(config.logsPath, function(err, list) {
            if (err) {
                res.send(404);
                return;
            }
            list.sort();
            var shortList = list.reverse().slice(0, 15);
            res.send(200, shortList);
        });
    });
};

exports.getLog = function(req, res) {
    var logFile = req.params.logId;
    fs.readFile(config.logsPath + logFile, "utf8", function(err, content) {
        if (err) {
            res.send(404);
        } else {
            res.send(200, ansi2html(content));
        }
    });
};
