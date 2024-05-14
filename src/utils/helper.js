const saltRounds = 10;
const bcrypt = require("bcryptjs");

const generateOtp = (num) => {
  if (num < 2) {
    return Math.floor(1000 + Math.random() * 9000);
  }
  const c = Math.pow(10, num - 1);

  return Math.floor(c + Math.random() * 9 * c);
};

const isEmpty = (val) => {
  return val === undefined ||
    val == null ||
    val.length == 0 ||
    Object.keys(val).length === 0
    ? true
    : false;
};
const hashPassword = async (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        resolve({ salt, hash });
      });
    });
  });
};

const comparePassword = async (password, hashedPassword) => {
  return new Promise((resolve, reject) => {
    let result = bcrypt.compare(password, hashedPassword);
    if (result) {
      resolve(result);
    } else {
      reject(Error);
    }
  });
};
const makePhoneNumberInternational = (phoneNumber) => {
  if (phoneNumber.substr(0, 1) === "0") {
    let internationalPrefix = "+234";
    let num10Digits = phoneNumber.substr(1);
    return internationalPrefix + num10Digits;
  } else if (phoneNumber.substr(1, 3) == "234") {
    return phoneNumber;
  } else {
    return phoneNumber;
  }
};
module.exports = {
  hashPassword,
  comparePassword,
  isEmpty,
  generateOtp,
  makePhoneNumberInternational,
};
