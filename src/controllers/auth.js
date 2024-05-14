const {
  logInMessage,
  invalidCredentials,
  userNotFound,
  serverError,
  unauthorisedPermission,
} = require("../constants/messages");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const models = require("../models");
const { comparePassword } = require("../utils/helper");
const { validateLoginUser } = require("../validation/user");
const logger = require("../config/logger");

const logIn = async (req, res) => {
  const { email, password } = req.body;

  const { error } = validateLoginUser(req.body);
  try {
    if (error != undefined) throw new Error(error.details[0].message);

    const user = await models.Users.findOne({
      where: {
        email,
      },
    });

    if (!user) throw new Error(invalidCredentials);

    if (user.dataValues.is_verified || user.dataValues.is_registered)
      throw new Error(unauthorisedPermission);

    const checkPasssword = await comparePassword(
      password,
      user.dataValues.password_hash
    );

    if (!checkPasssword) throw new Error(invalidCredentials);

    const token = jwt.sign(
      {
        email: user.dataValues.email,
        _id: uuidv4(),
      },
      process.env.JWT_SECRET || "somethingsecret",
      {
        expiresIn: "24h",
      }
    );

    res.set("Authorization", `Bearer ${token}`);
    return res.status(200).json({
      status: true,
      message: logInMessage,
      data: {
        token,
      },
    });
  } catch (error) {
    logger.error({ message: error.message });
    return res.status(500).json({
      status: false,
      message: error.message || serverError,
    });
  }
};

module.exports = {
  logIn,
};
