
export default class ApiError extends Error {

  public constructor(private code: number, message: string) {

    super(message);
  }

  public getCode(): number {

    return this.code;
  }
}
