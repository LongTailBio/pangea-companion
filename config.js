const envalid = require("envalid");
const { str, url, port } = envalid;

const config = envalid.cleanEnv(process.env, {
  PORT: port({ default: 3020 }),
  SESSION_SECRET: str({ desc: "Secure session secret" }),
  COMPANION_FILE_PATH: str(),
  PANGEA_BASE_URL: url(),
  AWS_KEY: str(),
  AWS_SECRET: str(),
  AWS_REGION: str({ default: "us-east-1" }),
  AWS_S3_ENDPOINT: url({ default: undefined }),
  AWS_S3_BUCKET: str()
});

export default config;
