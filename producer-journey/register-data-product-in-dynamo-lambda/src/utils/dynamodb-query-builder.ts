/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter, @typescript-eslint/no-unsafe-assignment */
export const filterEmptyStrings = <T>(objToFilter: T): T => {
  const keys = Object.keys(objToFilter) as Array<keyof T>;

  return keys.reduce((acc, next) => {
    let value = objToFilter[next] as any;

    if (typeof objToFilter[next] === 'string' && (objToFilter[next] as unknown as string).length === 0) {
      value = null;
    }

    acc[next] = value;

    return acc;
  }, {} as T);
};
