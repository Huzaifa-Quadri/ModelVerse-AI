import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";

export const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const validateRequiredFields = (data, fields) => {
  for (const field of fields) {
    if (
      !data[field] ||
      (typeof data[field] === "string" && !data[field].trim())
    ) {
      throw new AppError(`${field} is required`, HTTP_STATUS.BAD_REQUEST);
    }
  }
};

export const validateRegister = (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    validateRequiredFields({ name, email, password }, [
      "name",
      "email",
      "password",
    ]);

    if (!validateEmail(email)) {
      throw new AppError(ERROR_MESSAGES.INVALID_EMAIL, HTTP_STATUS.BAD_REQUEST);
    }

    if (password.length < 6) {
      throw new AppError(
        ERROR_MESSAGES.PASSWORD_TOO_SHORT,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    validateRequiredFields({ email, password }, ["email", "password"]);

    if (!validateEmail(email)) {
      throw new AppError(ERROR_MESSAGES.INVALID_EMAIL, HTTP_STATUS.BAD_REQUEST);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateMessage = (req, res, next) => {
  try {
    const { content, chatId } = req.body;

    validateRequiredFields({ content, chatId }, ["content", "chatId"]);

    next();
  } catch (error) {
    next(error);
  }
};
