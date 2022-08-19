export function HttpError(title, data) {
  Object.setPrototypeOf(this.constructor.prototype, Error.prototype);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
  this.name = this.constructor.name;
  this.title = title;
  this.message = title;
  this.data = data;
}
