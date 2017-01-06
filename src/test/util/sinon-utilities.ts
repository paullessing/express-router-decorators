import * as sinon from 'sinon';

export function stubCachePut(): Sinon.SinonSpy {
  return sinon.spy((key: string, value: any) => {
    return Promise.resolve(value);
  });
}

export function stubCachePutWithKey(expectedKey: string): Sinon.SinonSpy {
  return sinon.spy((actualKey: string, value: any) => {
    if (actualKey === expectedKey) {
      return Promise.resolve(value);
    }
    return undefined;
  });
}

/**
 * Matches whether a class used in a decorator matches the class name passed.
 */
export function matchClass(className: string): Sinon.SinonMatcher {
  return sinon.match((value: any) => {
    if (!value || !value.constructor) {
      return false;
    }
    const classNameMatcher = new RegExp(`(^|\\s)${className} \{`);
    return value.constructor.toString().match(classNameMatcher);
  });
}
