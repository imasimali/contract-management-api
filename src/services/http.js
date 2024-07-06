const path                         = require('path');
const express                      = require('express');
const { getProfile, errorHandler } = require('../middleware');
const OpenApiValidator             = require('express-openapi-validator');

function makeHttpService(dbModels, contractService, jobService, adminService) {
  const app = express();
  app.use(express.json());

  app.set('models', dbModels);

  const apiSpec = path.join(__dirname, '../../openapi.yaml');
  app.use(
    OpenApiValidator.middleware({
      apiSpec,
      validateRequests : true,
      validateResponses: true,
    })
  );

  app.get('/contracts/:id', getProfile, contractService.getContractById);
  app.get('/contracts', getProfile, contractService.getActiveContracts);

  app.get('/jobs/unpaid', getProfile, jobService.getUnpaidJobs);
  app.post('/jobs/:jobId/pay', getProfile, jobService.payForJob);
  app.post('/balances/deposit/:userId', getProfile, jobService.balanceDeposit);

  app.get('/admin/best-profession', adminService.getBestProfession);
  app.get('/admin/best-clients', adminService.getBestClients);

  app.use(errorHandler);

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}

module.exports = {
  makeHttpService,
};
