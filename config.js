var configLocation = process.env.CONFIG_MODULE;
if (!configLocation) {
    throw new Error("Cannot start application. Provide CONFIG_MODULE env variable with path to valid config file.");
}

module.exports = require(configLocation);