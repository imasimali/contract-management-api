const { Op, fn, col } = require('sequelize');

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

const balanceDeposit = async (req, res, next) => {
  try {
    const sequelize         = req.app.get('sequelize');
    const { Job, Contract } = req.app.get('models');
    const { userId }        = req.params;
    const { amount }        = req.body;

    if (!req.profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (req.profile.type !== 'client' || req.profile.id !== Number(userId)) {
      return res.status(403).json({ message: 'Only clients can deposit to their own account' });
    }

    const totalJobsToPay = await Job.sum('price', {
      where  : { paid: false, '$Contract.ClientId$': req.profile.id },
      include: [Contract],
    });

    const maxDepositLimit = totalJobsToPay * 0.25;

    if (req.body.amount > maxDepositLimit) {
      return res.status(400).json({ message: 'Deposit limit exceeded' });
    }

    const transaction = await sequelize.transaction();
    try {
      await req.profile.increment('balance', { by: req.body.amount, transaction });
      await transaction.commit();
      res.json({ message: 'Deposit successful' });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: 'Transaction failed', error });
    }
  } catch (err) {
    next(err);
  }
};

const getBestProfession = async (req, res, next) => {
  try {
    const { Profile, Contract, Job } = req.app.get('models');
    const { start, end }             = req.query;
    const [bestProfession]           = await Profile.findAll({
      where     : { type: 'contractor' },
      attributes: ['profession', [fn('SUM', col('ContractorContracts.Jobs.price')), 'totalEarned']],
      include   : [
        {
          model  : Contract,
          as     : 'ContractorContracts',
          include: [
            {
              model: Job,
              where: {
                paid       : true,
                paymentDate: { [Op.between]: [new Date(start), new Date(end)] },
              },
            },
          ],
        },
      ],
      group   : ['profession'],
      order   : [['totalEarned', 'DESC']],
      subQuery: false,
    });

    if (bestProfession) {
      res.json(bestProfession);
    } else {
      res.status(404).json({ message: 'No data available for the specified time range' });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getContractById, getActiveContracts, getUnpaidJobs, payForJob, balanceDeposit, getBestProfession };
