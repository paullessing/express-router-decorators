'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require('typescript');
var Lint = require('tslint/lib/lint');
var abstractRule_1 = require('tslint/lib/language/rule/abstractRule');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        if (sourceFile.fileName.match(/\.tests?\.ts$/i)) {
            return this.applyWithWalker(new AsyncExpectsWalker(sourceFile, this.getOptions()));
        }
        else {
            return [];
        }
    };
    return Rule;
}(abstractRule_1.AbstractRule));
exports.Rule = Rule;
var AsyncExpectsWalker = (function (_super) {
    __extends(AsyncExpectsWalker, _super);
    function AsyncExpectsWalker() {
        _super.apply(this, arguments);
    }
    AsyncExpectsWalker.prototype.visitCallExpression = function (node) {
        if (node.expression.getText() !== 'expect') {
            _super.prototype.visitCallExpression.call(this, node);
            return;
        }
        var block = this.getClosestBlock(node);
        var functionCall = this.getClosestCallExpression(block);
        if (!this.isReturnCalledCorrectly(functionCall)) {
            this.markNodeAsFailed(node);
        }
        _super.prototype.visitCallExpression.call(this, node);
    };
    AsyncExpectsWalker.prototype.isReturnCalledCorrectly = function (node) {
        var currentNode = node;
        var requiresPromiseAll = false;
        var returnCalled = true;
        while (currentNode) {
            var traceData = [];
            switch (currentNode.kind) {
                case ts.SyntaxKind.CallExpression:
                    var call = currentNode;
                    var text = call.expression.getText();
                    if (text === 'it') {
                        return true;
                    }
                    if (requiresPromiseAll) {
                        if (text !== 'Promise.all') {
                            return false;
                        }
                        else {
                            requiresPromiseAll = false;
                        }
                    }
                    else {
                        if (text === 'Promise.resolve' || text === 'Promise.reject') {
                            break;
                        }
                        var children = call.expression.getChildCount();
                        if (children === 0) {
                            return false;
                        }
                        var lastExpressionInCall = call.expression.getChildAt(children - 1).getText();
                        if (lastExpressionInCall === 'then' || lastExpressionInCall === 'catch') {
                            break;
                        }
                        else {
                            return false;
                        }
                    }
                    break;
                case ts.SyntaxKind.ArrayLiteralExpression:
                    requiresPromiseAll = true;
                    break;
                case ts.SyntaxKind.ReturnStatement:
                    returnCalled = true;
                    break;
                case ts.SyntaxKind.FunctionExpression:
                case ts.SyntaxKind.ArrowFunction:
                    if (!returnCalled) {
                        return false;
                    }
                    else {
                        returnCalled = false;
                    }
                    break;
                case ts.SyntaxKind.Block:
                    break;
                case ts.SyntaxKind.PropertyAccessExpression:
                    var access = currentNode;
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
    };
    AsyncExpectsWalker.prototype.markNodeAsFailed = function (node) {
        if (!this.isExcluded(node)) {
            _super.prototype.addFailure.call(this, this.createFailure(node.expression.getStart(), node.expression.getWidth(), 'Asynchronous "expects" must be in a return statement!'));
        }
        _super.prototype.visitCallExpression.call(this, node);
    };
    AsyncExpectsWalker.prototype.isExcluded = function (node) {
        var sourceFileText = node.getSourceFile().text;
        var commentRanges = ts.getLeadingCommentRanges(sourceFileText, node.getFullStart());
        if (commentRanges) {
            for (var _i = 0, commentRanges_1 = commentRanges; _i < commentRanges_1.length; _i++) {
                var commentRange = commentRanges_1[_i];
                var commentText = sourceFileText.substring(commentRange.pos, commentRange.end);
                if (commentText === '/* ignore async */') {
                    return true;
                }
            }
        }
        return false;
    };
    AsyncExpectsWalker.prototype.getClosestBlock = function (node) {
        while (node && node.parent && node.kind !== ts.SyntaxKind.Block) {
            node = node.parent;
        }
        return node;
    };
    AsyncExpectsWalker.prototype.getClosestCallExpression = function (node) {
        while (node && node.parent && node.kind !== ts.SyntaxKind.CallExpression) {
            node = node.parent;
        }
        return node;
    };
    return AsyncExpectsWalker;
}(Lint.RuleWalker));
