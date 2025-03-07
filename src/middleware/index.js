const getProfile = async (req, res, next) => {
  const { Profile } = req.app.get('models');
  const profile     = await Profile.findOne({ where: { id: req.get('profile_id') || 0 } });
  if (!profile) return res.status(401).end();
  req.profile = profile;
  next();
};

const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors : err.errors,
  });
};

module.exports = { getProfile, errorHandler };
