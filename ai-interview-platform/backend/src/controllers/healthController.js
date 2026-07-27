function getHealth(req, res) {
  res.json({
    status: "OK",
    message: "Backend is running successfully",
    version: "1.0.0",
  });
}

module.exports = {
  getHealth,
};