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

module.exports = { getContractById, getActiveContracts, getUnpaidJobs };
