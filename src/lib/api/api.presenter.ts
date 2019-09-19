
export default class ApiPresenter {

  public static getPresented<T extends Record<string, any>>(
    source: T,
    from: string[],
    to: string[]
  ): Record<string, any> {

    if (from.length !== to.length) {
      throw new TypeError('Arrays length mismatch');
    }

    const target: Record<string, any> = {};
    const params = Object.keys(source).filter((key: string) => from.indexOf(key) >= 0);
    if (params.length !== to.length) {
      throw new TypeError('Some properties are not found in source');
    }
    params.map((key: string, i: number) => target[to[i]] = source[key]);

    return target;
  }

  public static getPresentedList<T>(list: T[], from: string[], to: string[]): Record<string, any>[] {

    return list.map((entity: T) => ApiPresenter.getPresented(entity, from, to));
  }
}
