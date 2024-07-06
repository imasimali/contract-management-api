const { Op, fn, col, literal } = require('sequelize');

class AdminService {
  constructor(models) {
    this.Profile  = models.Profile;
    this.Contract = models.Contract;
    this.Job      = models.Job;
  }

  getBestProfession = async (req, res, next) => {
    try {
      const { start, end } = req.query;
      const startDate      = new Date(start);
      const endDate        = new Date(end);

      const bestProfession = await this.Profile.findOne({
        where     : { type: 'contractor' },
        attributes: ['profession', [fn('SUM', col('ContractorContracts.Jobs.price')), 'totalEarned']],
        include   : [
          {
            model     : this.Contract,
            as        : 'ContractorContracts',
            attributes: [],
            include   : [
              {
                model     : this.Job,
                attributes: [],
                where     : {
                  paid       : true,
                  paymentDate: { [Op.between]: [startDate, endDate] },
                },
              },
            ],
          },
        ],
        group   : ['Profile.profession'],
        order   : [[literal('totalEarned'), 'DESC']],
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

  getBestClients = async (req, res, next) => {
    try {
      const { start, end, limit = 2 } = req.query;
      const startDate                 = new Date(start);
      const endDate                   = new Date(end);

      const bestClients = await this.Profile.findAll({
        where     : { type: 'client' },
        attributes: [
          'id',
          [fn('concat', col('firstName'), ' ', col('lastName')), 'fullName'],
          [fn('SUM', col('ClientContracts.Jobs.price')), 'totalSpent'],
        ],
        include: [
          {
            model     : this.Contract,
            as        : 'ClientContracts',
            attributes: [],
            include   : [
              {
                model     : this.Job,
                attributes: [],
                where     : {
                  paid       : true,
                  paymentDate: { [Op.between]: [startDate, endDate] },
                },
              },
            ],
          },
        ],
        group   : ['Profile.id'],
        order   : [[literal('totalSpent'), 'DESC']],
        limit   : parseInt(limit, 10),
        subQuery: false,
      });

      if (bestClients.length) {
        res.json(bestClients);
      } else {
        res.status(404).json({ message: 'No data available for the specified time range' });
      }
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { AdminService };
