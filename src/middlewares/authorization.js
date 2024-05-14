const jwt = require("jsonwebtoken");
require("dotenv").config();

import { NextFunction, Request, Response } from "express";

import messages from "../constants/messages";
import response from "../utils/response";

const Authorization = (req, res, next) => {
  const authorization = req.headers.authorization || "";

  try {
    if (!authorization) throw new Error(messages.unauthorisedAccess);

    const tokenSplit = authorization.split(" ");

    jwt.verify(
      tokenSplit[1],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) throw new Error(messages.unauthorisedAccess);

        req.params.userEmail = decoded.email;

        next();
      }
    );
  } catch (error) {
    response(res, 401, error.message || messages.serverError);
  }
};

export default Authorization;