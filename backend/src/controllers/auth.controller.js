import { catchAsync, AppError } from "../utils/errorHandler.js";
import { generateToken, generateRefreshToken } from "../utils/tokens.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";
import User from "../models/user.model.js";
import { sendVerificationEmail } from "../utils/email.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { getVerificationHTML } from "../utils/verificationTemplate.js";

const recieverEmail = "thegentledude883@gmail.com";

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError(ERROR_MESSAGES.USER_EXISTS, HTTP_STATUS.CONFLICT));
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate JWT token
  const token = generateToken(user._id, user.email);
  // console.log("Registered user token : ", token);
  res.cookie("token", token);

  // Log successful registration
  console.log(`✅ New user registered: ${user.email}`);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Registration successful",
    data: {
      userId: user._id,
      name: user.name,
      email: user.email,
      token,
    },
  });

  //! Sending a email with dummy link for now till we get actual link-
  const port = process.env.PORT;
  const sent = await sendVerificationEmail({
    // email: user.email,
    email: recieverEmail, //for now; will send mail only on this email as dummy emails will be used in testing
    name: user.name,
    verificationLink:
      process.env.backendURL ||
      `http://localhost:${port}/api/auth/verify/${token}`,
  });
  if (sent) {
    console.log("📧 Verification Email sent successfully");
  } else {
    console.log("❎ Verification Email not sent");
  }
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new AppError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
      ),
    );
  }

  // Compare passwords
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(
      new AppError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
      ),
    );
  }

  if (!user.isVerified) {
    return next(
      new AppError(ERROR_MESSAGES.USER_NOT_VERIFIED, HTTP_STATUS.UNAUTHORIZED),
    );
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate JWT token
  const token = generateToken(user._id, user.email);
  // console.log("Logged in user token : ", token);
  res.cookie("token", token);

  // Log successful login
  console.log(`✅ User logged in: ${user.email}`);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Login successful",
    data: {
      userId: user._id,
      name: user.name,
      email: user.email,
      token,
    },
  });
});

export const refresh = catchAsync(async (req, res, next) => {
  // User is already verified by verifyToken middleware
  const { userId, email } = req.user;

  // Generate new token
  const newToken = generateToken(userId, email);

  // Log token refresh
  console.log(`🔄 Token refreshed for user: ${email}`);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      token: newToken,
    },
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const { userId } = req.user;

  const user = await User.findById(userId);

  if (!user) {
    return next(
      new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND),
    );
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "User profile retrieved",
    data: user,
  });
});

export const verifyEmailToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(
          getVerificationHTML(
            "User Not Found",
            "The account associated with this verification link does not exist.",
            false,
          ),
        );
    }

    if (user.isVerified) {
      return res
        .status(HTTP_STATUS.OK)
        .send(
          getVerificationHTML(
            "Account Already Verified",
            "Your account has already been verified. You can proceed to log in.",
            true,
          ),
        );
    }

    user.isVerified = true;
    await user.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(
        getVerificationHTML(
          "Account Verified!",
          "Your email has been successfully verified. You can now access all features of your account.",
          true,
        ),
      );
  } catch (error) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .send(
        getVerificationHTML(
          "Invalid or Expired Link",
          "The verification link is invalid or has expired. Please request a new one.",
          false,
        ),
      );
  }
};

export const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("token");
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logged out successfully",
  });
});
