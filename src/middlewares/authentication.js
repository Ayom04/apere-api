import { NextFunction, Request, Response } from "express";

import response from "../utils/response";
const models = require("../models");

const { unauthorisedAccess, serverError } = require("../constants/messages");

const authentication = async (req, res, next) => {
  const userEmail = req.params.userEmail;
  try {
    if (!userEmail) throw new Error(unauthorisedAccess);

    const userData = await models.Users.findOne({
      where: { email: userEmail },
    });
    if (!userData) throw new Error(unauthorisedAccess);

    req.params.user_id = userData.user_id;

    next();
  } catch (error) {
    response(res, 401, error.message || serverError);
  }
};

export default authentication;
