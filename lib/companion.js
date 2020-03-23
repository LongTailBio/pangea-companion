const config = require("./config");
const logger = require("./logger");
const { UnknownContribModuleError } = require("./errors");

const options = {
  debug: true,
  filePath: config.COMPANION_FILE_PATH,
  server: {
    host: `127.0.0.1:${config.PORT}`,
    protocol: "http"
  },
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
        const { userId } = req.pangea || {};
        if (!userId) {
          const err = new Error("Pangea user ID was somehow missing!");
          err.request = req;
          throw err;
        }

        const { contrib_module } = metadata;
        if (contrib_module === "covid19") {
          logger.info("issued_covid19_upload_url", {
            userId,
            filename,
            metadata
          });
          const filenameComponents = filename.split('/').reverse();
          const base = filenameComponents[0];
          return `covid19/reads/user-${userId}.${base}`;
        }

        throw new UnknownContribModuleError(contrib_module);
      },
      acl: "private"
    }
  }
};

module.exports = options;
