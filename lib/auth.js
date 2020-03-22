const request = require("superagent");

const config = require("./config");
const logger = require("./logger");

const pangeaAuth = (req, res, next) => {
  // Do not require authorization for pre-flight checks
  if (req.method === "OPTIONS") return next();

  // Require a valid Pangea user account
  const pangeaToken = req.header("x-pangea-token") || "";
  request
    .get(`${config.PANGEA_BASE_URL}/api/auth/users/me/`)
    .set("Authorization", `Token ${pangeaToken}`)
    .then(result => {
      req.pangea = { userId: result.body.id };
      return next();
    })
    .catch(err => {
      if (err.response.status === 403) {
        return res
          .status(403)
          .send({ success: false, message: "unauthorized" });
      }

      // Unexpected error response status code -- better log it!
      logger.error("unexpected_error_response_status_code", {
        status_code: err.response.status,
        body: err.response.body,
        err_message: err.message
      });
      return res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    });
};

module.exports = pangeaAuth;
