'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require('typescript');
var Lint = require('tslint/lib/lint');
var abstractRule_1 = require('tslint/lib/language/rule/abstractRule');
var QuoteMark;
(function (QuoteMark) {
    QuoteMark[QuoteMark["SINGLE_QUOTES"] = 0] = "SINGLE_QUOTES";
    QuoteMark[QuoteMark["DOUBLE_QUOTES"] = 1] = "DOUBLE_QUOTES";
})(QuoteMark || (QuoteMark = {}));
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.isEnabled = function () {
        if (_super.prototype.isEnabled.call(this)) {
            var quoteMarkString = this.getOptions().ruleArguments[0];
            return (quoteMarkString === 'single' || quoteMarkString === 'double');
        }
        return false;
    };
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new QuotemarkWalker(sourceFile, this.getOptions()));
    };
    Rule.SINGLE_QUOTE_FAILURE = "\" should be '";
    Rule.DOUBLE_QUOTE_FAILURE = "' should be \"";
    return Rule;
}(abstractRule_1.AbstractRule));
exports.Rule = Rule;
var QuotemarkWalker = (function (_super) {
    __extends(QuotemarkWalker, _super);
    function QuotemarkWalker(sourceFile, options) {
        _super.call(this, sourceFile, options);
        var ruleArguments = this.getOptions();
        if (ruleArguments.indexOf('single') > -1) {
            this.quoteMark = QuoteMark.SINGLE_QUOTES;
        }
        else {
            this.quoteMark = QuoteMark.DOUBLE_QUOTES;
        }
        this.avoidEscape = ruleArguments.indexOf('avoid-escape') > 0;
    }
    QuotemarkWalker.prototype.visitStringLiteral = function (node) {
        if (node.parent.kind === ts.SyntaxKind.ImportDeclaration) {
            _super.prototype.visitStringLiteral.call(this, node);
            return;
        }
        var text = node.getText();
        var width = node.getWidth();
        var position = node.getStart();
        var firstCharacter = text.charAt(0);
        var lastCharacter = text.charAt(text.length - 1);
        var expectedQuoteMark = (this.quoteMark === QuoteMark.SINGLE_QUOTES) ? "'" : "\"";
        if (firstCharacter !== expectedQuoteMark || lastCharacter !== expectedQuoteMark) {
            var includesOtherQuoteMark = text.slice(1, -1).indexOf(expectedQuoteMark) !== -1;
            if (!(this.avoidEscape && includesOtherQuoteMark)) {
                var failureMessage = (this.quoteMark === QuoteMark.SINGLE_QUOTES)
                    ? Rule.SINGLE_QUOTE_FAILURE
                    : Rule.DOUBLE_QUOTE_FAILURE;
                this.addFailure(this.createFailure(position, width, failureMessage));
            }
        }
        _super.prototype.visitStringLiteral.call(this, node);
    };
    return QuotemarkWalker;
}(Lint.RuleWalker));
