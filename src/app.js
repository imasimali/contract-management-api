const express          = require('express');
const router           = require('./routes');
const { sequelize }    = require('./models');
const { errorHandler } = require('./middlewares');

const app = express();
app.use(express.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use(router);

app.use(errorHandler);

module.exports = app;
