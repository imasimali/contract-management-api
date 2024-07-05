function makeLogger(config = {}) {
  const levels = ['error', 'warn', 'info'];
  const logger = {};

  levels.forEach((level) => {
    if (config[level] !== false) {
      logger[level] = console[level].bind(console);
    } else {
      logger[level] = () => {};
    }
  });

  return logger;
}

module.exports = { makeLogger };
