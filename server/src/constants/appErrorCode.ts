const enum AppErrorCode {
  InvalidAccessToken = "INVALID_ACCESS_TOKEN",
  InvalidRefreshToken = "INVALID_REFRESH_TOKEN",
  EmailAlreadyExists = "EMAIL_ALREADY_EXISTS",
  PhoneAlreadyExists = "PHONE_ALREADY_EXISTS",
  UserNotFound = "USER_NOT_FOUND",
  InvalidCredentials = "INVALID_CREDENTIALS",
  EmailNotVerified = "EMAIL_NOT_VERIFIED",
  InsufficientPermissions = "INSUFFICIENT_PERMISSIONS",
  SessionExpired = "SESSION_EXPIRED",
  VerificationCodeExpired = "VERIFICATION_CODE_EXPIRED",
  TooManyRequests = "TOO_MANY_REQUESTS",
}

export default AppErrorCode;
