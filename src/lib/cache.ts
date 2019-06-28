interface Storage {
  [key: string]: any;
}

export default class Cache {

  private cache: Storage = {};

  public set(key: string, value: any): any {

    return this.insert(key.split('.'), value);
  }

  public get(key: string): any | undefined {

    return this.select(key.split('.'));
  }

  private insert(path: string[], value: any): void {

    return this.iterate(path, (next: any, key: any, idx: number): void => {

      if (idx == path.length - 1) {
        next[key] = value;
      }
      if (!next[key]) {
        next[key] = {};
      }
    });
  }

  private select(path: string[]): any {

    return this.iterate(
      path,
      (next: any, key: any): boolean => !next.hasOwnProperty(key)
    );
  }

  private iterate(
    path: string[],
    iterator: (next: any, key: any, idx: number) => boolean | void
  ): any {

    let next = this.cache;
    for (const key of path) {

      if (iterator(next, key, path.indexOf(key)) == true) {

        return undefined;
      }
      next = next[key];
    }
    return next;
  }
}
