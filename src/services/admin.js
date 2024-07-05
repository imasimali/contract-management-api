const { Op, fn, col } = require('sequelize');

class AdminService {
  constructor(models) {
    this.Profile  = models.Profile;
    this.Contract = models.Contract;
    this.Job      = models.Job;
  }

  async getBestProfession(req, res, next) {
    try {
      const { start, end }   = req.query;
      const [bestProfession] = await this.Profile.findAll({
        where     : { type: 'contractor' },
        attributes: ['profession', [fn('SUM', col('ContractorContracts.Jobs.price')), 'totalEarned']],
        include   : [
          {
            model  : this.Contract,
            as     : 'ContractorContracts',
            include: [
              {
                model: this.Job,
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
  }

  async getBestClients(req, res, next) {
    try {
      const { start, end, limit = 2 } = req.query;
      const bestClients               = await this.Profile.findAll({
        where     : { type: 'client' },
        attributes: [
          'id',
          [fn('concat', col('firstName'), ' ', col('lastName')), 'fullName'],
          [fn('SUM', col('ClientContracts.Jobs.price')), 'totalSpent'],
        ],
        include: [
          {
            model  : this.Contract,
            as     : 'ClientContracts',
            include: [
              {
                model: this.Job,
                where: {
                  paid       : true,
                  paymentDate: { [Op.between]: [new Date(start), new Date(end)] },
                },
              },
            ],
          },
        ],
        group   : ['Profile.id'],
        order   : [['totalSpent', 'DESC']],
        subQuery: false,
        limit,
      });

      if (bestClients.length) {
        res.json(bestClients);
      } else {
        res.status(404).json({ message: 'No data available for the specified time range' });
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { AdminService };
