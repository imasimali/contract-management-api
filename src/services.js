const { Op } = require('sequelize');

const getContractById = async (req, res, next) => {
  try {
    const { Contract } = req.app.get('models');
    const { id }       = req.params;
    const contract     = await Contract.findOne({
      where: {
        id,
        [Op.or]: [{ ClientId: req.profile.id }, { ContractorId: req.profile.id }],
        status : 'in_progress',
      },
    });
    if (!contract) {
      return res.status(403).json({ message: 'Contract not found or access denied' });
    }
    res.json(contract);
  } catch (err) {
    next(err);
  }
};

const getActiveContracts = async (req, res, next) => {
  try {
    const { Contract } = req.app.get('models');
    const contracts    = await Contract.findAll({
      where: {
        [Op.or]: [{ ClientId: req.profile.id }, { ContractorId: req.profile.id }],
        status : 'in_progress',
      },
    });
    res.json(contracts);
  } catch (err) {
    next(err);
  }
};

const getUnpaidJobs = async (req, res, next) => {
  try {
    const { Job, Contract } = req.app.get('models');
    const unpaidJobs        = await Job.findAll({
      include: [
        {
          model   : Contract,
          required: true,
          where   : {
            [Op.or]: [{ ClientId: req.profile.id }, { ContractorId: req.profile.id }],
            status : 'in_progress',
          },
        },
      ],
      where: { paid: false },
    });
    res.json(unpaidJobs);
  } catch (err) {
    next(err);
  }
};

const payForJob = async (req, res, next) => {
  try {
    const sequelize         = req.app.get('sequelize');
    const { Job, Contract } = req.app.get('models');
    const { jobId }         = req.params;

    const job = await Job.findOne({
      where  : { id: jobId, paid: { [Op.not]: true } },
      include: [{ model: Contract, include: ['Contractor'] }],
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or already paid' });
    }

    if (req.profile.balance < job.price) {
      return res.status(403).json({ message: 'Insufficient balance' });
    }

    if (job.Contract.ContractorId === req.profile.id) {
      return res.status(403).json({ message: 'Contractors cannot pay for their own jobs' });
    }

    const transaction = await sequelize.transaction();
    try {
      await req.profile.decrement('balance', { by: job.price, transaction });
      await job.Contract.Contractor.increment('balance', { by: job.price, transaction });
      await job.update({ paid: true, paymentDate: new Date() }, { transaction });

      await transaction.commit();
      res.json({ message: 'Payment successful' });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: 'Transaction failed', error });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getContractById, getActiveContracts, getUnpaidJobs, payForJob };
