/*
 * GET home page.
 */
var config = require('../config');

exports.index = function(req, res) {
    var envs = config.environments;

    res.render('index', {
        title: 'Deployment App',
        subtitle: config.appName,
        envs: envs
    });
};