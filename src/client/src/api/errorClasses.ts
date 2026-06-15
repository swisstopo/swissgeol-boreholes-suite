export class ApiError extends Error {
  status?: number;
  messageKey?: string;
  details?: Record<string, unknown>;

  constructor(message: string, status?: number, messageKey?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.message = message;
    this.status = status;
    this.messageKey = messageKey;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class InvalidRouteParamError extends Error {
  readonly userMessage: string;

  constructor(message: string, userMessage: string) {
    super(message);
    this.name = "InvalidRouteParamError";
    this.userMessage = userMessage;
  }
}
