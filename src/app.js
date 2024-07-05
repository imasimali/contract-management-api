const express       = require('express');
const router        = require('./routes');
const { sequelize } = require('./models');

const app = express();
app.use(express.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use(router);

module.exports = app;
