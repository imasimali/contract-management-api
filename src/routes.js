const { Router }     = require('express');
const { getProfile } = require('./middlewares');
const services       = require('./services');

const router = Router();

// Contract routes
router.get('/contracts/:id', getProfile, services.getContractById);
router.get('/contracts', getProfile, services.getActiveContracts);

// Job routes
router.get('/jobs/unpaid', getProfile, services.getUnpaidJobs);
router.post('/jobs/:jobId/pay', getProfile, services.payForJob);

// Balance routes
router.post('/balances/deposit/:userId', getProfile, services.balanceDeposit);

// Admin routes
router.get('/admin/best-profession', services.getBestProfession);
router.get('/admin/best-clients', services.getBestClients);

module.exports = router;
