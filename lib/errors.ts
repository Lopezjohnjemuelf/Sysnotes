export class PersistenceError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "PersistenceError";
  }
}
