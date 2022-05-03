/**
 * It returns a mock object for a given object type
 *
 * @param { T } objectType - Object original type
 *
 * @returns { jest.Mock<T, Y> } The mock object which wraps the original object type
 */
export const getMockObject = <T, Y extends Array<any> = any>(objectType: T): jest.Mock<T, Y> =>
  objectType as unknown as jest.Mock<T, Y>;
