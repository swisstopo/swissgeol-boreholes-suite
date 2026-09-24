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
 * The reason fields every problem document from the API may carry. Each response carries only a
 * subset of them, so every reader has to check.
 */
interface ProblemDetail {
  detail?: string;
  message?: string;
  messageKey?: string;
}

/**
 * A problem response the API sends for a failure the user can act on, as opposed to one only a
 * developer can. The `userError` type is what marks it: the global handler leaves those alone so
 * that the code which made the call can report the reason itself.
 */
interface UserErrorProblem extends ProblemDetail, Record<string, unknown> {
  type?: string;
}

/**
 * An error body from the import endpoints. They answer with a validation problem carrying per-field
 * errors, with a translated user error, or with a plain problem document.
 */
export interface ErrorResponse extends ProblemDetail {
  // Keyed by the field that failed, as ValidationProblemDetails reports it.
  errors?: Record<string, string[]>;
}

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

const isOptionalFieldErrors = (value: unknown): value is Record<string, string[]> | undefined => {
  if (value === undefined) return true;
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every(
    messages => Array.isArray(messages) && messages.every(message => typeof message === "string"),
  );
};

/**
 * Whether a parsed response body carries the reason fields an import error is read through. Every
 * field is optional, so this only rules out a body whose fields are present in another shape.
 * @param body The parsed response body.
 * @returns True if the body can be read as an import error.
 */
export const isErrorResponse = (body: unknown): body is ErrorResponse => {
  if (typeof body !== "object" || body === null) return false;
  const { detail, errors, message, messageKey } = body as Record<string, unknown>;
  return (
    isOptionalString(detail) &&
    isOptionalString(message) &&
    isOptionalString(messageKey) &&
    isOptionalFieldErrors(errors)
  );
};

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

/**
 * Reads the reason out of an error response body, whichever shape it arrived in. The API answers
 * with a problem document for most failures and with plain text for the rest.
 * @param body The parsed response body.
 * @returns The reason, or undefined when the body carries none.
 */
export const toErrorMessage = (body: unknown): string | undefined => {
  if (typeof body === "string") {
    return body || undefined;
  }
  if (typeof body === "object" && body !== null) {
    const { detail, title } = body as { detail?: unknown; title?: unknown };
    if (typeof detail === "string") return detail;
    if (typeof title === "string") return title;
  }
  return undefined;
};

export class InvalidRouteParamError extends Error {
  readonly userMessage: string;

  constructor(message: string, userMessage: string) {
    super(message);
    this.name = "InvalidRouteParamError";
    this.userMessage = userMessage;
  }
}
