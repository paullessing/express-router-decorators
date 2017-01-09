'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require('typescript');
var Lint = require('tslint/lib/lint');
var abstractRule_1 = require('tslint/lib/language/rule/abstractRule');
exports.REQUIRED = 'required';
var NO_WHITESPACE_ALLOWED = 'No whitespace allowed between function or method name and parameters.';
var WHITESPACE_REQUIRED = 'Missing whitespace between function or method name and parameters.';
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new MethodSpaceWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(abstractRule_1.AbstractRule));
exports.Rule = Rule;
var MethodSpaceWalker = (function (_super) {
    __extends(MethodSpaceWalker, _super);
    function MethodSpaceWalker(sourceFile, options) {
        _super.call(this, sourceFile, options);
        this.banSpace = !this.hasOption(exports.REQUIRED);
        this.message = this.banSpace ? NO_WHITESPACE_ALLOWED : WHITESPACE_REQUIRED;
    }
    MethodSpaceWalker.prototype.visitMethodDeclaration = function (node) {
        this.checkForWhitespace(node);
        _super.prototype.visitMethodDeclaration.call(this, node);
    };
    MethodSpaceWalker.prototype.visitMethodSignature = function (node) {
        this.checkForWhitespace(node);
        _super.prototype.visitMethodSignature.call(this, node);
    };
    MethodSpaceWalker.prototype.visitFunctionDeclaration = function (node) {
        this.checkForWhitespace(node);
        _super.prototype.visitFunctionDeclaration.call(this, node);
    };
    MethodSpaceWalker.prototype.visitFunctionExpression = function (node) {
        this.checkForWhitespace(node);
        _super.prototype.visitFunctionExpression.call(this, node);
    };
    MethodSpaceWalker.prototype.visitSetAccessor = function (node) {
        this.checkForWhitespace(node);
        _super.prototype.visitSetAccessor.call(this, node);
    };
    MethodSpaceWalker.prototype.visitGetAccessor = function (node) {
        this.checkForWhitespace(node);
        _super.prototype.visitGetAccessor.call(this, node);
    };
    MethodSpaceWalker.prototype.createScanner = function (text) {
        return ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, text);
    };
    MethodSpaceWalker.prototype.checkForWhitespace = function (node) {
        var scanner = this.createScanner(node.getText());
        var positionOfOpenParens = node.getChildren().map(function (child) { return child.kind; }).indexOf(ts.SyntaxKind.OpenParenToken);
        var lastNodeBeforeParens = node.getChildAt(positionOfOpenParens - 1);
        scanner.setTextPos(lastNodeBeforeParens.getEnd() - node.getStart());
        var isWhitespace = scanner.scan() === ts.SyntaxKind.WhitespaceTrivia;
        if (this.banSpace === isWhitespace) {
            _super.prototype.addFailure.call(this, this.createFailure(lastNodeBeforeParens.getEnd(), 1, this.message));
        }
    };
    MethodSpaceWalker.total = 0;
    return MethodSpaceWalker;
}(Lint.RuleWalker));
