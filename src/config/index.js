function makeConfig(penv = process.env) {
  const app = {
    env      : penv.NODE_ENV || 'development',
    namespace: penv.APP_NAMESPACE || 'api',
    name     : penv.APP_NAME || 'contract-management-api',
    version  : penv.APP_VERSION || '1.0.0',
    port     : parseInt(penv.PORT, 10) || 3001,
  };

  if (isNaN(app.port)) {
    throw new Error('Invalid port number');
  }

  const logger = {
    error: penv.LOG_ERROR !== 'false',
    warn  : penv.LOG_WARN !== 'false',
    info  : penv.LOG_INFO !== 'false',
  };

  return { app, logger };
}

module.exports = { makeConfig };
