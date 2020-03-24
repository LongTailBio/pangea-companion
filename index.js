const companion = require('@uppy/companion');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const config = require('./lib/config');
const logger = require('./lib/logger');
const pangeaAuth = require('./lib/auth');
const options = require('./lib/companion');
const { UnknownContribModuleError } = require('./lib/errors');

const companionApp = companion.app(options);

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    preflightContinue: true,
    allowedHeaders: ['content-type', 'x-pangea-token'],
  }),
);

app.use(pangeaAuth);
app.use(companionApp);

app.use((err, req, res, next) => {
  if (!res.headersSent && err instanceof UnknownContribModuleError) {
    logger.info('unknown_contrib_module', { module_name: err.moduleName });
    res.status(400);
    return res.send(err.message);
  }
  return next(err);
});

const server = app.listen(config.PORT, config.HOST, () => {
  const host = server.address().address;
  const port = server.address().port;
  logger.info(`Pangea Companion listening at http://${host}:${port}`);
});

companion.socket(server, options);
