'use strict';

import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
import {AbstractRule} from 'tslint/lib/language/rule/abstractRule';

/**
 * A non-comprehensive check for asynchronous expect() calls.
 * It bans asynchronous expect() calls unless they are inside a promise;
 * and when they are inside a promise, it ensures the promise result is returned from the surrounding it() call.
 *
 * To ignore a specific instance, put the comment / * ignore async * / (minus the extra spaces) above the expect() call.
 */
export class Rule extends AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    if (sourceFile.fileName.match(/\.tests?\.ts$/i)) {
      return this.applyWithWalker(new AsyncExpectsWalker(sourceFile, this.getOptions()));
    } else {
      // Skip this file
      return [];
    }
  }
}

class AsyncExpectsWalker extends Lint.RuleWalker {

  public visitCallExpression(node: ts.CallExpression): void {
    if (node.expression.getText() !== 'expect') {
      super.visitCallExpression(node);
      return;
    }

    // Skip to the first function call surrounding this node
    let block = this.getClosestBlock(node);
    let functionCall = this.getClosestCallExpression(block);

    // Ensure that this call returns correctly all the way up to 'it'
    if (!this.isReturnCalledCorrectly(functionCall)) {
      this.markNodeAsFailed(node);
    }

    super.visitCallExpression(node);
  }

  private isReturnCalledCorrectly(node: ts.Node): boolean {
    // While we haven't hit an 'it', iterate up and ensure every expression is returned...

    let currentNode = node;
    let requiresPromiseAll = false;
    let returnCalled = true; // We don't need to call return on the innermost call, so start by pretending it's already called
    while (currentNode) {
      let traceData = [];
      switch (currentNode.kind) {
        case ts.SyntaxKind.CallExpression:
          // Function call like "it('', () => )" or "console.log('foo')"
          let call = <ts.CallExpression> currentNode;
          let text = call.expression.getText();
          if (text === 'it') {
            return true;
          }
          if (requiresPromiseAll) {
            if (text !== 'Promise.all') {
              return false;
            } else {
              requiresPromiseAll = false;
            }
          } else {
            if (text === 'Promise.resolve' || text === 'Promise.reject') {
              break; // These are always OK since they chain
            }
            let children = call.expression.getChildCount();
            if (children === 0) {
              return false;
            }
            let lastExpressionInCall = call.expression.getChildAt(children - 1).getText();
            if (lastExpressionInCall === 'then' || lastExpressionInCall === 'catch') {
              break;
            } else {
              return false;
            }
          }
          break;
        case ts.SyntaxKind.ArrayLiteralExpression:
          // If the call is wrapped in an array then it has to be inside a Promsise.all()
          requiresPromiseAll = true;
          break;
        case ts.SyntaxKind.ReturnStatement:
          // Return is called; allow the next parent function definition
          returnCalled = true;
          break;
        case ts.SyntaxKind.FunctionExpression: /* falls through */
        case ts.SyntaxKind.ArrowFunction:
          if (!returnCalled) {
            return false;
          } else {
            returnCalled = false;
          }
          break;
        case ts.SyntaxKind.Block:
          // Any kind of block is neutral
          break;
        case ts.SyntaxKind.PropertyAccessExpression:
          // This might be something like promise.then().catch(), which would be OK. Anything else isn't
          let access = <ts.PropertyAccessExpression> currentNode;
          if (access.name.text !== 'then' && access.name.text !== 'catch' && access.name.text !== 'finally') {
            return false;
          }
          break;
        default:
          return false;
      }
      currentNode = currentNode.parent;
    }
    return true;
  }

  private markNodeAsFailed(node: ts.CallExpression): void {
    if (!this.isExcluded(node)) {
      super.addFailure(this.createFailure(node.expression.getStart(), node.expression.getWidth(), 'Asynchronous "expects" must be in a return statement!'));
    }
    super.visitCallExpression(node);
  }

  private isExcluded(node: ts.Node): boolean {
    const sourceFileText = node.getSourceFile().text;
    const commentRanges = ts.getLeadingCommentRanges(sourceFileText, node.getFullStart());
    if (commentRanges) {
      for (let commentRange of commentRanges) {
        const commentText = sourceFileText.substring(commentRange.pos, commentRange.end);
        if (commentText === '/* ignore async */') {
          return true;
        }
      }
    }
    return false;
  }

  private getClosestBlock(node: ts.Node): ts.Block {
    while (node && node.parent && node.kind !== ts.SyntaxKind.Block) {
      node = node.parent;
    }
    return node as ts.Block;
  }

  private getClosestCallExpression(node: ts.Node): ts.CallExpression {
    while (node && node.parent && node.kind !== ts.SyntaxKind.CallExpression) {
      node = node.parent;
    }
    return node as ts.CallExpression;
  }
}
