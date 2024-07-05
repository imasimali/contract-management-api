const { Op } = require('sequelize');

const getContractById = async (req, res, next) => {
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
};

module.exports = { getContractById };
