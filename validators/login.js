const validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  // Validators for email field
  if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "Email field is requierd";
  }

  // Validators for password field
  if (validator.isEmpty(data.password)) {
    errors.password = "Password field is mandatory";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
