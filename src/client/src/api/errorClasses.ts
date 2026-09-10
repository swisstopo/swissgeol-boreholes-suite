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

/**
 * A problem response the API sends for a failure the user can act on, as opposed to one only a
 * developer can. The `userError` type is what marks it: the global handler leaves those alone so
 * that the code which made the call can report the reason itself.
 */
export interface UserErrorProblem extends Record<string, unknown> {
  type?: string;
  detail?: string;
  message?: string;
  messageKey?: string;
}

/**
 * Whether a response body is a problem naming something the user can act on.
 * @param body The parsed response body.
 * @returns True if the body carries a reason worth showing to the user.
 */
export const isUserErrorProblem = (body: unknown): body is UserErrorProblem =>
  typeof body === "object" && body !== null && (body as UserErrorProblem).type === "userError";

/**
 * Builds the error for a problem the user can act on, so that every caller reports one alike.
 * @param problem The problem response.
 * @param status The HTTP status it arrived with.
 * @returns The error to throw.
 */
export const toUserError = (problem: UserErrorProblem, status?: number): ApiError =>
  new ApiError(problem.detail || problem.message || "", status, problem.messageKey, problem);

export class InvalidRouteParamError extends Error {
  readonly userMessage: string;

  constructor(message: string, userMessage: string) {
    super(message);
    this.name = "InvalidRouteParamError";
    this.userMessage = userMessage;
  }
}
