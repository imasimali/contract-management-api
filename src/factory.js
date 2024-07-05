const { makeConfig }          = require('./config');
const { makeLogger }          = require('./logger');
const { sequelize }           = require('./models');
const { makeHttpService }     = require('./services/http');
const { AdminService }        = require('./services/admin');
const { ContractService }     = require('./services/contract');
const { JobService }          = require('./services/job');
const { PaymentQueueService } = require('./services/payment-queue');

async function factory(penv = process.env) {
  const config = makeConfig(penv);
  const logger = makeLogger(config);

  const dbModels = sequelize.models;

  const paymentQueueService = new PaymentQueueService(dbModels);
  const contractService     = new ContractService(dbModels);
  const jobService          = new JobService(dbModels, sequelize, paymentQueueService);
  const adminService        = new AdminService(dbModels);

  const app = makeHttpService(dbModels, contractService, jobService, adminService, paymentQueueService);

  return {
    app,
    logger,
    config,
  };
}

module.exports = factory;
