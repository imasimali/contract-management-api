const { Op } = require('sequelize');

class JobService {
  constructor(models, sequelize, paymentQueueService) {
    this.Job                 = models.Job;
    this.Contract            = models.Contract;
    this.sequelize           = sequelize;
    this.paymentQueueService = paymentQueueService;
  }

  async getUnpaidJobs(req, res, next) {
    try {
      const unpaidJobs = await this.Job.findAll({
        include: [
          {
            model   : this.Contract,
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
  }

  async payForJob(req, res, next) {
    try {
      this.paymentQueueService.enqueue(async () => {
        const { jobId } = req.params;

        const job = await this.Job.findOne({
          where  : { id: jobId, paid: { [Op.not]: true } },
          include: [{ model: this.Contract, include: ['Contractor'] }],
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

        const transaction = await this.sequelize.transaction();
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
      });
    } catch (err) {
      next(err);
    }
  }

  async balanceDeposit(req, res, next) {
    try {
      this.paymentQueueService.enqueue(async () => {
        const { userId } = req.params;
        const { amount } = req.body;

        if (!req.profile) {
          return res.status(404).json({ message: 'User not found' });
        }

        if (amount <= 0) {
          return res.status(400).json({ message: 'Invalid amount' });
        }

        if (req.profile.type !== 'client' || req.profile.id !== Number(userId)) {
          return res.status(403).json({ message: 'Only clients can deposit to their own account' });
        }

        const totalJobsToPay = await this.Job.sum('price', {
          where  : { paid: false, '$Contract.ClientId$': req.profile.id },
          include: [this.Contract],
        });

        const maxDepositLimit = totalJobsToPay * 0.25;

        if (req.body.amount > maxDepositLimit) {
          return res.status(400).json({ message: 'Deposit limit exceeded' });
        }

        const transaction = await this.sequelize.transaction();
        try {
          await req.profile.increment('balance', { by: req.body.amount, transaction });
          await transaction.commit();
          res.json({ message: 'Deposit successful' });
        } catch (error) {
          await transaction.rollback();
          res.status(500).json({ message: 'Transaction failed', error });
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { JobService };
