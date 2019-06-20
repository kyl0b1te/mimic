
export default class ApiError extends Error {

  constructor(public code: number, message: string) {
    super(message)
  }
}
