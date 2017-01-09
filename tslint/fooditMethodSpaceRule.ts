'use strict';

import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
import {AbstractRule} from 'tslint/lib/language/rule/abstractRule';

export const REQUIRED: string = 'required';

const NO_WHITESPACE_ALLOWED = 'No whitespace allowed between function or method name and parameters.';
const WHITESPACE_REQUIRED = 'Missing whitespace between function or method name and parameters.';

export class Rule extends AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new MethodSpaceWalker(sourceFile, this.getOptions()));
  }
}

class MethodSpaceWalker extends Lint.RuleWalker {

  private banSpace: boolean;
  private message: string;
  private static total: number = 0;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    this.banSpace = !this.hasOption(REQUIRED);
    this.message = this.banSpace ? NO_WHITESPACE_ALLOWED : WHITESPACE_REQUIRED;
  }

  // Like "public foo(): void {}" on a class
  public visitMethodDeclaration(node: ts.MethodDeclaration): void {
    this.checkForWhitespace(node);
    super.visitMethodDeclaration(node);
  }

  // Like "foo(): void" in an interface
  public visitMethodSignature(node: ts.MethodSignature): void {
    this.checkForWhitespace(node);
    super.visitMethodSignature(node);
  }

  // Like "function foo(): void {}" inside a block context
  public visitFunctionDeclaration(node: ts.FunctionDeclaration): void {
    this.checkForWhitespace(node);
    super.visitFunctionDeclaration(node);
  }

  // Like "[].forEach(function foo(bar: any): void {})"
  // or "(function () {})()"
  // or other kinds of IIFE
  public visitFunctionExpression(node: ts.FunctionExpression): void {
    this.checkForWhitespace(node);
    super.visitFunctionExpression(node);
  }

  // Like "public set foo(bar: string): void {}" on a class
  public visitSetAccessor(node: ts.AccessorDeclaration): void {
    this.checkForWhitespace(node);
    super.visitSetAccessor(node);
  }

  // Like "public get foo(): string {}" on a class
  public visitGetAccessor(node: ts.AccessorDeclaration): void {
    this.checkForWhitespace(node);
    super.visitGetAccessor(node);
  }

  private createScanner(text: string): ts.Scanner {
    return ts.createScanner(ts.ScriptTarget.ES5, /* skipTrivia */ false, ts.LanguageVariant.Standard, text);
  }

  private checkForWhitespace(node: ts.Node): void {
    let scanner = this.createScanner(node.getText());

    const positionOfOpenParens = node.getChildren().map(child => child.kind).indexOf(ts.SyntaxKind.OpenParenToken);
    let lastNodeBeforeParens = node.getChildAt(positionOfOpenParens - 1);

    scanner.setTextPos(lastNodeBeforeParens.getEnd() - node.getStart());
    const isWhitespace = scanner.scan() === ts.SyntaxKind.WhitespaceTrivia;
    if (this.banSpace === isWhitespace) {
      super.addFailure(this.createFailure(lastNodeBeforeParens.getEnd(), 1, this.message));
    }
  }
}
