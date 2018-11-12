const validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = function validateExperienceInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  // Validator for job title
  if (validator.isEmpty(data.title)) {
    errors.title = "Job title is mandatory";
  }

  // Validator for company
  if (validator.isEmpty(data.company)) {
    errors.company = "Company is mandatory";
  }

  // Validator for from date
  if (validator.isEmpty(data.from)) {
    errors.from = "From date is mandatory";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
