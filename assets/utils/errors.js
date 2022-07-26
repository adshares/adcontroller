export function HttpError(message, data) {
  Object.setPrototypeOf(this.constructor.prototype, Error.prototype);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
  this.name = this.constructor.name;
  this.message = message;
  this.data = data;
}
