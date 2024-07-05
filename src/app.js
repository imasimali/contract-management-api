const express        = require('express');
const { sequelize }  = require('./model');
const { getProfile } = require('./middleware');
const app            = express();
app.use(express.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);


app.get('/contracts/:id', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models');
  const { id }       = req.params;
  const contract     = await Contract.findOne({ where: { id } });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

module.exports = app;
