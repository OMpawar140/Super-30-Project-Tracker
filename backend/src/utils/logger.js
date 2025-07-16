class logger {
    static info(message, ...optionalParams) {
        console.info(`[INFO] [${new Date().toISOString()}]:`, message, ...optionalParams);
    }

    static warn(message, ...optionalParams) {
        console.warn(`[WARN] [${new Date().toISOString()}]:`, message, ...optionalParams);
    }

    static error(message, ...optionalParams) {
        console.error(`[ERROR] [${new Date().toISOString()}]:`, message, ...optionalParams);
    }

    static debug(message, ...optionalParams) {
        console.debug(`[DEBUG] [${new Date().toISOString()}]:`, message, ...optionalParams);
    }
}

module.exports = logger;