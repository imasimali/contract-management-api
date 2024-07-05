const express                      = require('express');
const { getProfile, errorHandler } = require('../middleware');

function makeHttpService(dbModels, contractService, jobService, adminService) {
  const app = express();
  app.use(express.json());

  app.set('models', dbModels);

  app.get('/contracts/:id', getProfile, (req, res, next) => contractService.getContractById(req, res, next));
  app.get('/contracts', getProfile, (req, res, next) => contractService.getActiveContracts(req, res, next));

  app.get('/jobs/unpaid', getProfile, (req, res, next) => jobService.getUnpaidJobs(req, res, next));
  app.post('/jobs/:jobId/pay', getProfile, (req, res, next) => jobService.payForJob(req, res, next));
  app.post('/balances/deposit/:userId', getProfile, (req, res, next) => jobService.balanceDeposit(req, res, next));

  app.get('/admin/best-profession', (req, res, next) => adminService.getBestProfession(req, res, next));
  app.get('/admin/best-clients', (req, res, next) => adminService.getBestClients(req, res, next));

  app.use(errorHandler);

  return app;
}

module.exports = {
  makeHttpService,
};
