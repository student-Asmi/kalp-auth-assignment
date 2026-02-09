const dashboard = async (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    userId: req.user.userId,
  });
};

module.exports = dashboard;
