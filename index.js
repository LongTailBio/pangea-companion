const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const companion = require("@uppy/companion");
const request = require("superagent");

const config = require("./config");
const logger = require("./logger");

var app = express();
app.use(bodyParser.json());

// Express Session
const sess = {
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {}
};
if (config.isProd) {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}
app.use(session(sess));

// CORS
const corsOptions = {
  allowedHeaders: ["content-type", "X-Pangea-Token"],
  exposedHeaders: ["X-Pangea-Token"]
};
app.options("*", cors({ ...corsOptions, methods: ["OPTIONS"] }));
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allowed-Headers",
    "Authorization, Origin, Content-Type, Accept, X-Pangea-Token"
  );
  next();
});

// Pangea Auth
app.use((req, res, next) => {
  const pangeaToken = req.header("x-pangea-token");
  console.log(Object.keys(req.headers));
  request
    .get(`${config.PANGEA_BASE_URL}/auth/users/me/`)
    .set("Authorization", `Bearer ${pangeaToken}`)
    .then(result => {
      console.log(result);
      res.status(403).send("too bad");
    })
    .catch(() =>
      res.status(403).send({ success: false, message: "unauthorized" })
    );
});

// Companion
const options = {
  providerOptions: {
    s3: {
      key: config.AWS_KEY,
      secret: config.AWS_SECRET,
      bucket: config.AWS_S3_BUCKET,
      region: config.AWS_REGION,
      awsClientOptions: config.AWS_S3_ENDPOINT
        ? {
            endpoint: config.AWS_S3_ENDPOINT
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
    host: `127.0.0.1:${config.PORT}`,
    protocol: "http"
  },
  filePath: config.COMPANION_FILE_PATH
};

app.use(companion.app(options));

const server = app.listen(config.PORT, "127.0.0.1", () => {
  const host = server.address().address;
  const port = server.address().port;
  logger.info(`Pangea Companion listening at http://${host}:${port}`);
});

companion.socket(server, options);
