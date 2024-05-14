const { v4: uuidv4 } = require("uuid");
const {
  serverError,
  userExists,
  registerUserMessage,
  userNotFound,
  invalidOTP,
  otpExpired,
  otpResentMessage,
  unauthorisedAccess,
  emailHasNotBeenVerified,
  userVerified,
  createUserMessage,
  unauthorisedPermission,
  invalidCredentials,
  resetPasswordOtpSentSuccessfully,
  passwordUpdatedSuccesfully,
} = require("../constants/messages");
const {
  hashPassword,
  generateOtp,
  makePhoneNumberInternational,
} = require("../utils/helper");
const {
  validateEmail,
  validateResigterUser,
  validateVerifyUser,
  validatePassword,
} = require("../validation/user");
const logger = require("../config/logger");
const models = require("../models");
const { readFileAndSendEmail } = require("../services/email");

const createAccount = async (req, res) => {
  const { email } = req.body;
  try {
    const { error } = validateEmail(req.body);
    if (error != undefined) throw new Error(error.details[0].message);

    const user = await models.Users.findOne({
      where: { email },
    });

    if (user) throw new Error(userExists);

    const otp = generateOtp(4);

    await models.Users.create({
      user_id: uuidv4(),
      email,
    });

    await models.Otps.create({
      otp_id: uuidv4(),
      otp,
      email,
    });

    const dataReplacement = {
      otp,
    };

    await readFileAndSendEmail(
      email,
      "OTP Verification",
      dataReplacement,
      "create_account"
    );

    res.status(201).json({
      status: true,
      message: createUserMessage,
    });
  } catch (error) {
    logger.error({ message: error.message });
    res.status(500).json({
      status: false,
      message: error.message || serverError,
    });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.params;

  try {
    const checkIfuserExists = await models.Otps.findOne({
      where: {
        email,
        otp,
      },
    });

    if (!checkIfuserExists) throw new Error(invalidOTP);
    const timeDifference = new Date() - new Date(checkIfuserExists.createdAt);
    const timeDifferenceInMinutes = Math.ceil(timeDifference / (1000 * 60));
    if (timeDifferenceInMinutes > 60) throw new Error(otpExpired);

    await models.Users.update(
      { is_verified: true, is_registered: true },
      { where: { email } }
    );

    await models.Otps.destroy({
      where: { email },
    });

    res.status(200).json({
      status: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    logger.error({ message: error.message });
    res.status(500).json({
      status: false,
      message: error.message || serverError,
    });
  }
};

const registerUser = async (req, res) => {
  const { firstName, lastName, phone, password, email } = req.body;
  try {
    const { error } = validateResigterUser(req.body);
    if (error != undefined) throw new Error(error.details[0].message);

    const user = await models.Users.findOne({
      where: { email },
    });

    if (!user) throw new Error(userExists);

    if (!user.dataValues.is_verified) throw new Error(emailHasNotBeenVerified);

    if (!user.dataValues.is_registered) throw new Error(unauthorisedPermission);

    const formattedPhone = makePhoneNumberInternational(phone);

    const { hash } = await hashPassword(password);

    await models.Users.update(
      {
        firstName,
        lastName,
        phone: formattedPhone,
        password_hash: hash,
      },
      {
        where: { email },
      }
    );

    res.status(201).json({
      status: true,
      message: registerUserMessage,
    });
  } catch (error) {
    logger.error({ message: error.message });
    res.status(500).json({
      status: false,
      message: error.message || serverError,
    });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const { error } = validateEmail(req.body);
    if (error != undefined) throw new Error(error.details[0].message);

    const checkIfuserExists = await models.Users.findOne({
      where: {
        email,
      },
    });

    if (!checkIfuserExists) throw new Error(unauthorisedAccess);

    if (checkIfuserExists.dataValues.is_verified) throw new Error(userVerified);

    const otp = generateOtp(6);

    await models.Otps.create({
      otp: otp,
      otp_id: uuidv4(),
      email,
    });
    const dataReplacement = {
      otp,
    };
    await readFileAndSendEmail(
      email,
      "Resend OTP Verification",
      dataReplacement,
      "resend_otp"
    );

    res.status(200).json({
      status: true,
      message: otpResentMessage,
    });
  } catch (error) {
    logger.error({ message: error.message });
    res.status(500).json({
      status: false,
      message: error.message || serverError,
    });
  }
};

const startForgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const { error } = validateEmail(req.body);
  try {
    if (error !== undefined) throw new Error(error.details[0].message);

    const user = await models.Users.findOne({ where: { email } });

    if (!user) throw new Error(invalidCredentials);

    const otp = generateOtp(6);

    const _otp = await models.Otps.findOne({ where: { email } });
    if (!_otp) {
      await models.Otps.create({
        otp_id: uuidv4(),
        otp,
        email,
      });
    }
    const { hash } = await hashPassword(String(otp));
    const link = `${process.env.USER_RESET_PASSWORD_URL}?email=${email}&otp=${hash}`;

    const dataReplacement = {
      resetPasswordlink: link,
    };

    await readFileAndSendEmail(
      email,
      "password reset",
      dataReplacement,
      "forget_password"
    );

    return res.status(200).json({
      status: true,
      message: resetPasswordOtpSentSuccessfully,
    });
  } catch (error) {
    logger.error({ message: error.message });
    return res.status(400).json({
      status: false,
      message: error.message || serverError,
    });
  }
};

const completeForgetPassword = async (req, res) => {
  const { password } = req.body;
  const { email, otp } = req.query;
  const { error } = validatePassword(req.body);
  try {
    if (error !== undefined) throw new Error(error.details[0].message);

    const user = await models.Users.findOne({ where: { email } });
    if (!user) throw new Error(invalidCredentials);

    const _otp = await models.Otps.findOne({
      where: {
        email,
      },
    });
    if (!_otp) throw new Error(notFound);
    const checkIfOtpMatch = comparePassword(_otp.dataValues.otp, otp);
    if (!checkIfOtpMatch) throw new Error(invalidOtp);

    const timeDifference =
      new Date().getTime() - new Date(_otp.createdAt).getTime();

    const timeDifferenceInMinutes = Math.ceil(
      timeDifference / (1000 * 60 * 60 * 24)
    );

    if (timeDifferenceInMinutes > 5) throw new Error(otpExpired);

    const { hash } = await hashPassword(password);
    await models.Users.update(
      {
        password_hash: hash,
      },
      {
        where: { email },
      }
    );

    await models.Otps.destroy({
      where: {
        email,
      },
    });
    return res.status(200).json({
      status: true,
      message: passwordUpdatedSuccesfully,
    });
  } catch (error) {
    logger.error({ message: error.message });
    return res.status(400).json({
      status: false,
      message: error.message || serverError,
    });
  }
};

module.exports = {
  createAccount,
  registerUser,
  verifyOtp,
  resendOtp,
  startForgetPassword,
  completeForgetPassword,
};
