const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
});

class Profile extends Sequelize.Model {}
Profile.init(
  {
    firstName: {
      type     : Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type     : Sequelize.STRING,
      allowNull: false,
    },
    profession: {
      type     : Sequelize.STRING,
      allowNull: false,
    },
    balance: {
      type        : Sequelize.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    type: {
      type     : Sequelize.ENUM('client', 'contractor'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Profile',
  }
);

class Contract extends Sequelize.Model {}
Contract.init(
  {
    terms: {
      type     : Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type        : Sequelize.ENUM('new', 'in_progress', 'terminated'),
      defaultValue: 'new',
      allowNull   : false,
    },
  },
  {
    sequelize,
    modelName: 'Contract',
  }
);

class Job extends Sequelize.Model {}
Job.init(
  {
    description: {
      type     : Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type     : Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type        : Sequelize.BOOLEAN,
      defaultValue: false,
    },
    paymentDate: {
      type     : Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Job',
  }
);

Profile.hasMany(Contract, { as: 'ContractorContracts', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Contractor', foreignKey: 'ContractorId' });

Profile.hasMany(Contract, { as: 'ClientContracts', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Client', foreignKey: 'ClientId' });

Contract.hasMany(Job, { foreignKey: 'ContractId' });
Job.belongsTo(Contract, { foreignKey: 'ContractId' });

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job,
};
