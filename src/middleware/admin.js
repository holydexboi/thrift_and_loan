const config = require("config");

module.exports = function(req, res, next) {
  // 401 Unauthorized
  // 403 Forbidden

  if (!req.member.isAdmin) return res.status(403).send("Access denied.");

  next();
};