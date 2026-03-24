export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  INVALID_EMAIL: "Invalid email format",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters",
  USER_EXISTS: "User already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_TOKEN: "Invalid token",
  UNAUTHORIZED: "Unauthorized access",
  INTERNAL_ERROR: "Internal server error",
  QUERY_REQUIRED: "Search query is required",
  MESSAGE_REQUIRED: "Message content is required",
  USER_NOT_VERIFIED: "User not verified",
  USER_ALREADY_VERIFIED: "User already verified",
  VERIFICATION_LINK_EXPIRED: "Verification link has expired",
};

export const API_VERSION = "/api/v1";
