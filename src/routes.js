const { Router }     = require('express');
const { getProfile } = require('./middlewares');
const services       = require('./services');

const router = Router();
router.get('/contracts/:id', getProfile, services.getContractById);
router.get('/contracts', getProfile, services.getActiveContracts);

module.exports = router;
