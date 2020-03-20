const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const companion = require("@uppy/companion");
const winston = require("winston");
const envalid = require("envalid");
const { str, url, port } = envalid;

const logger = winston.createLogger({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

const env = envalid.cleanEnv(process.env, {
  PORT: port({ default: 3020 }),
  SESSION_SECRET: str({ desc: "Secure session secret" }),
  COMPANION_FILE_PATH: str(),
  AWS_KEY: str(),
  AWS_SECRET: str(),
  AWS_REGION: str({ default: "us-east-1" }),
  AWS_S3_ENDPOINT: url({ default: undefined }),
  AWS_S3_BUCKET: str()
});

var app = express();
app.use(cors());
app.use(bodyParser.json());

const sess = {
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {}
};

if (env.isProd) {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

// Companion
const options = {
  providerOptions: {
    s3: {
      key: env.AWS_KEY,
      secret: env.AWS_SECRET,
      bucket: env.AWS_S3_BUCKET,
      region: env.AWS_REGION,
      awsClientOptions: env.AWS_S3_ENDPOINT
        ? {
            endpoint: env.AWS_S3_ENDPOINT
          }
        : {},
      getKey: (req, filename, metadata) => {
        const { userId } = metadata;
        logger.info("Getting key", { filename, metadata });
        if (!userId) throw new Error("Must provide userId!");
        return `covid19/user-${userId}`;
      },
      acl: "private"
    }
  },
  server: {
    host: `127.0.0.1:${env.PORT}`,
    protocol: "http"
  },
  filePath: env.COMPANION_FILE_PATH
};

app.use(companion.app(options));

const server = app.listen(env.PORT, "127.0.0.1", () => {
  const host = server.address().address;
  const port = server.address().port;
  logger.info(`Pangea Companion listening at http://${host}:${port}`);
});

companion.socket(server, options);
