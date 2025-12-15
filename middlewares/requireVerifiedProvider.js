const requireVerifiedProvider = (req, res, next) => {
  if (
    req.user.role === "provider" &&
    !req.user.isVerifiedProvider
  ) {
    return res.status(403).json({
      message: "Your account is pending admin verification",
    });
  }
  next();
};

module.exports = requireVerifiedProvider;
