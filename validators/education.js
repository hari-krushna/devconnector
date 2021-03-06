const validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  // Validator for School
  if (validator.isEmpty(data.school)) {
    errors.school = "School field is mandatory";
  }

  // Validator for degree
  if (validator.isEmpty(data.degree)) {
    errors.degree = "Degree field is mandatory";
  }

  // Validator for fieldofstudy
  if (validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = "Field of study field is mandatory";
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
