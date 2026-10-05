module.exports = async function (req, res) {
  try {
    const userEmail = await UserEmail.findOne({ user: req.session.usr });

    return res.ok({
      email: userEmail?.email ?? null,
      promotional: userEmail?.promotional ?? false,
    });
  } catch (err) {
    return res.badRequest(err);
  }
};
