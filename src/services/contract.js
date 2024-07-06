const { Op } = require('sequelize');

class ContractService {
  constructor(models) {
    this.Contract = models.Contract;
  }

  getContractById = async (req, res, next) => {
    try {
      const { id }   = req.params;
      const contract = await this.Contract.findOne({
        where: {
          id,
          [Op.or]: [{ ClientId: req.profile.id }, { ContractorId: req.profile.id }],
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

  getActiveContracts = async (req, res, next) => {
    try {
      const contracts = await this.Contract.findAll({
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
}

module.exports = { ContractService };
