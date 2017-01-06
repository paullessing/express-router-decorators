import {expect} from 'chai';
import * as sinon from 'sinon';

import {matchClass} from '../util';
import {RouterRegistry} from '../../lib/router.registry';
import {Method, Get, Post, Put, Patch, Delete, Options} from '../../lib/methods.decorator';

describe('Method and HTTP Verb decorators', () => {
  let registry: any,
    getInstanceStub: Sinon.SinonStub;

  beforeEach(() => {
    registry = {
      addMethod: sinon.stub()
    };

    getInstanceStub = sinon.stub(RouterRegistry, 'getInstance');
    getInstanceStub.returns(registry);
  });

  afterEach(() => getInstanceStub.restore());

  describe('@Method', () => {
    it('should add an entry with the correct verb and path to the registry when the path is a string', () => {
      class ClassWithParsedMethods {
        @Method('head', '/object/id')
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'head', '/object/id');
    });

    it('should add an entry with the correct path to the registry when the path is an array', () => {
      class ClassWithParsedMethods {
        @Method('head', ['/object/id', '/v1/object/id'])
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'head', ['/object/id', '/v1/object/id']);
    });
  });

  describe('@Get', () => {
    it('should add an entry with the correct path to the registry when the path is a string', () => {
      class ClassWithParsedMethods {
        @Get('/object/id')
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'get', '/object/id');
    });

    it('should add an entry with the correct path to the registry when the path is an array', () => {
      class ClassWithParsedMethods {
        @Get(['/object/id', '/v1/object/id'])
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'get', ['/object/id', '/v1/object/id']);
    });
  });

  describe('@Post', () => {
    it('should add an entry with the correct path to the registry when the path is a string', () => {
      class ClassWithParsedMethods {
        @Post('/object/id')
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'post', '/object/id');
    });

    it('should add an entry with the correct path to the registry when the path is an array', () => {
      class ClassWithParsedMethods {
        @Post(['/object/id', '/v1/object/id'])
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'post', ['/object/id', '/v1/object/id']);
    });
  });

  describe('@Put', () => {
    it('should add an entry with the correct path to the registry when the path is a string', () => {
      class ClassWithParsedMethods {
        @Put('/object/id')
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'put', '/object/id');
    });

    it('should add an entry with the correct path to the registry when the path is an array', () => {
      class ClassWithParsedMethods {
        @Put(['/object/id', '/v1/object/id'])
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'put', ['/object/id', '/v1/object/id']);
    });
  });

  describe('@Patch', () => {
    it('should add an entry with the correct path to the registry when the path is a string', () => {
      class ClassWithParsedMethods {
        @Patch('/object/id')
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'patch', '/object/id');
    });

    it('should add an entry with the correct path to the registry when the path is an array', () => {
      class ClassWithParsedMethods {
        @Patch(['/object/id', '/v1/object/id'])
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'patch', ['/object/id', '/v1/object/id']);
    });
  });

  describe('@Delete', () => {
    it('should add an entry with the correct path to the registry when the path is a string', () => {
      class ClassWithParsedMethods {
        @Delete('/object/id')
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'delete', '/object/id');
    });

    it('should add an entry with the correct path to the registry when the path is an array', () => {
      class ClassWithParsedMethods {
        @Delete(['/object/id', '/v1/object/id'])
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'delete', ['/object/id', '/v1/object/id']);
    });
  });

  describe('@Options', () => {
    it('should add an entry with the correct path to the registry when the path is a string', () => {
      class ClassWithParsedMethods {
        @Options('/object/id')
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'options', '/object/id');
    });

    it('should add an entry with the correct path to the registry when the path is an array', () => {
      class ClassWithParsedMethods {
        @Options(['/object/id', '/v1/object/id'])
        public parsedMethod(): void {
        }
      }

      expect(registry.addMethod).to.have.been.calledOnce;
      expect(registry.addMethod).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', 'options', ['/object/id', '/v1/object/id']);
    });
  });
});
