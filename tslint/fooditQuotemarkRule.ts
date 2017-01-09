'use strict';

import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
import {AbstractRule} from 'tslint/lib/language/rule/abstractRule';

enum QuoteMark {
  SINGLE_QUOTES,
  DOUBLE_QUOTES
}

export class Rule extends AbstractRule {
  public static SINGLE_QUOTE_FAILURE: string = `" should be '`;
  public static DOUBLE_QUOTE_FAILURE: string = `' should be "`;

  public isEnabled(): boolean {
    if (super.isEnabled()) {
      const quoteMarkString = this.getOptions().ruleArguments[0];
      return (quoteMarkString === 'single' || quoteMarkString === 'double');
    }

    return false;
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new QuotemarkWalker(sourceFile, this.getOptions()));
  }
}

class QuotemarkWalker extends Lint.RuleWalker {
  private quoteMark: QuoteMark;
  private avoidEscape: boolean;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    const ruleArguments = this.getOptions();

    if (ruleArguments.indexOf('single') > -1) {
      this.quoteMark = QuoteMark.SINGLE_QUOTES;
    } else {
      this.quoteMark = QuoteMark.DOUBLE_QUOTES;
    }

    this.avoidEscape = ruleArguments.indexOf('avoid-escape') > 0;
  }

  public visitStringLiteral(node: ts.StringLiteral): void {
    if (node.parent.kind === ts.SyntaxKind.ImportDeclaration) {
      super.visitStringLiteral(node);
      return;
    }

    const text = node.getText();
    const width = node.getWidth();
    const position = node.getStart();

    const firstCharacter = text.charAt(0);
    const lastCharacter = text.charAt(text.length - 1);

    const expectedQuoteMark = (this.quoteMark === QuoteMark.SINGLE_QUOTES) ? `'` : `"`;

    if (firstCharacter !== expectedQuoteMark || lastCharacter !== expectedQuoteMark) {
      // allow the "other" quote mark to be used, but only to avoid having to escape
      const includesOtherQuoteMark = text.slice(1, -1).indexOf(expectedQuoteMark) !== -1;

      if (!(this.avoidEscape && includesOtherQuoteMark)) {
        const failureMessage = (this.quoteMark === QuoteMark.SINGLE_QUOTES)
          ? Rule.SINGLE_QUOTE_FAILURE
          : Rule.DOUBLE_QUOTE_FAILURE;

        this.addFailure(this.createFailure(position, width, failureMessage));
      }
    }

    super.visitStringLiteral(node);
  }
}
