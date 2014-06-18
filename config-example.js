module.exports = {

    appName: 'Exemplary App',
    logsPath: process.cwd() + '/logs/',
    port: 9000,

    environments: {
        "prod": {
            "name": "prod",
            "path": "/srv/prod",
            "options": {},
            "btn": {
                "confirm": true,
                "class": "btn-danger",
                "label": "Deploy on prod"
            }
        },
        "staging": {
            "name": "staging",
            "path": "/srv/staging",
            "options": {
                "migrateDb": true,
                "restartServer": true
            },
            "btn": {
                "class": "btn-warning",
                "label": "Deploy on Staging"
            }
        },
        "dev": {
            "name": "dev",
            "path": "/srv/dev",
            "options": {
                "overwriteDb": true,
                "restartServer": true,
                "fixDbPermissions": true
            },
            "btn": {
                "class": "btn-info",
                "label": "Deploy on Dev"
            }
        }
    },

    deploy: function(commands, env) {
        commands.addBash("git pull", "Updating working copy");

        commands.addBash("npm install", "Installing npm modules");

        commands.addBash("grunt build", "Build");

        if (env.overwriteDb) {
            commands.addBash("./recreate.sh all", "Recreating database");
        }
        if (env.migrateDb) {
            commands.addBash("./migrate.sh", "Migrating database");
        }
        if (env.fixDbPermissions) {
            commands.addBash("sudo fix_db_permissions");
        }
        if (env.restartServer) {
            commands.addBash("sudo srv_restart", "Restarting server");
        }
    }

};