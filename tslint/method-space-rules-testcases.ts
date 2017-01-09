namespace Foodit.Marketplace.Foo {
  'use strict';

  interface Foo {
    (bar: string): void;
    foo(): void;
    bar (): void;
  }

  export class MyFoo {
    constructor(
    ) {
    }

    public myFoo (): void { //1
    }

    public get foo (): string { //2
      return 'foo';
    }

    public get bar(): string { //3
      return 'bar';
    }

    public set foo(foo: string) { //4
    }

    public set bar (foo: string) { //5
    }

    public myBar(x: string): void { //6
      [].forEach(function (): void { //7
      });

      [].forEach(function named (): void { //8
      });

      [].forEach(function namedNone(): void { //9
      });

      [].forEach(function(): void {}); //10
    }

    public myBaz  (): void { //11
      function internalFunWith (): void { //12
      }

      function internalFunWithout(): void { //13
      }

      internalFunWith();
      internalFunWithout();
    }
  }

  (function (): void {})(); //14
  (function(): void {})(); //15
  (function namedW (): void {})(); //16
  (function namedWO(): void {})(); //17

  function externalFunctionWithSpace (): void { //18
  }

  function externalFunctionWithoutSpace(): void { //19
  }

  (function(): void { //20
    externalFunctionWithSpace();
    externalFunctionWithoutSpace();
  })();
}
