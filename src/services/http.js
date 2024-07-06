const express                      = require('express');
const { getProfile, errorHandler } = require('../middleware');

function makeHttpService(dbModels, contractService, jobService, adminService) {
  const app = express();
  app.use(express.json());

  app.set('models', dbModels);

  // Contract routes
  app.get('/contracts/:id', getProfile, contractService.getContractById);
  app.get('/contracts', getProfile, contractService.getActiveContracts);

  // Job routes
  app.get('/jobs/unpaid', getProfile, jobService.getUnpaidJobs);
  app.post('/jobs/:jobId/pay', getProfile, jobService.payForJob);
  app.post('/balances/deposit/:userId', getProfile, jobService.balanceDeposit);

  // Admin routes
  app.get('/admin/best-profession', adminService.getBestProfession);
  app.get('/admin/best-clients', adminService.getBestClients);

  // Error handling middleware
  app.use(errorHandler);

  // 404 route
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}

module.exports = {
  makeHttpService,
};
