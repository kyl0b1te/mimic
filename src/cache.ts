
interface Storage {
  [key: string]: string;
}

export default class Cache {

  private cache: Storage = {};

  public set(key: string, value: string): void {

    this.cache[key] = value
  }

  public get(key: string): string | undefined {

    return this.cache[key];
  }
}
