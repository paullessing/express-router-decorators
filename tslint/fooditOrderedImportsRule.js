"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var abstractRule_1 = require('tslint/lib/language/rule/abstractRule');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        var orderedImportsWalker = new FooditOrderedImportsWalker(sourceFile, this.getOptions());
        this.applyWithWalker(orderedImportsWalker);
        return orderedImportsWalker.getFailures();
    };
    Rule.EXTERNAL_BEFORE_INTERNAL_FAILURE = 'External imports should appear before internal imports.';
    Rule.EXTERNAL_RULES_ALPHABETICAL_FAILURE = 'External imports should be ordered alphabetically.';
    Rule.IMPORTS_CONTAINED_IN_BARREL_FAILURE = 'Multiple imports from a single folder should be grouped with a barrel file.';
    Rule.SEPARATE_EXTERNAL_AND_INTERNAL_FAILURE = 'Internal sources should be separated from external sources by a blank line.';
    Rule.IMPORT_EQUALS_FAILURE = 'Use "import from" instead of "import equals".';
    Rule.DUPLICATE_SOURCE_FAILURE = 'Duplicate import source.';
    return Rule;
}(abstractRule_1.AbstractRule));
exports.Rule = Rule;
function getParent(source) {
    if (source.match(/^\.\.?\//)) {
        return null;
    }
    var firstSlash = source.indexOf('/');
    if (firstSlash < 0) {
        return source;
    }
    return source.substring(0, firstSlash);
}
function isExternal(source) {
    return !!getParent(source);
}
function normalise(source) {
    source = source.toLowerCase();
    source = source.replace(/(^['"]|['"]$)/gi, '');
    return source;
}
function isContained(importSource, barrelSource) {
    if (isExternal(importSource) || isExternal(barrelSource)) {
        return false;
    }
    return barrelSource.length > importSource.length && barrelSource.indexOf(importSource + '/') === 0;
}
var FooditOrderedImportsWalker = (function (_super) {
    __extends(FooditOrderedImportsWalker, _super);
    function FooditOrderedImportsWalker(sourceFile, options) {
        _super.call(this, sourceFile, options);
        if (options.ruleArguments.length) {
            this.allowImportEquals = options.ruleArguments[0]['allow-import-equals'] || [];
        }
        else {
            this.allowImportEquals = [];
        }
        this.sources = [];
    }
    FooditOrderedImportsWalker.prototype.visitImportDeclaration = function (node) {
        var prefixLength = node.getStart() - node.getFullStart();
        var prefix = node.getFullText().slice(0, prefixLength);
        var source = normalise(node.moduleSpecifier.getText());
        this.sources.push({
            source: source,
            start: node.getStart(),
            width: node.getWidth(),
            isExternal: isExternal(source),
            prefix: prefix
        });
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    FooditOrderedImportsWalker.prototype.visitImportEqualsDeclaration = function (node) {
        if (this.isInvalidImportFrom(node.getText())) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.IMPORT_EQUALS_FAILURE));
        }
        _super.prototype.visitImportEqualsDeclaration.call(this, node);
    };
    FooditOrderedImportsWalker.prototype.getFailures = function () {
        var _this = this;
        var failures = _super.prototype.getFailures.call(this).slice();
        if (!this.sources.length) {
            return failures;
        }
        var internalSources = this.sources.filter(function (source) { return !source.isExternal; });
        var externalSources = this.sources.filter(function (source) { return source.isExternal; });
        var hasOrderFailure = false;
        this.sources.forEach(function (thisSource, thisIndex) {
            _this.sources.forEach(function (thatSource, thatIndex) {
                if (thisIndex === thatIndex) {
                    return;
                }
                if (isContained(thisSource.source, thatSource.source)) {
                    failures.push(_this.createFailure(thisSource.start, thisSource.width, Rule.IMPORTS_CONTAINED_IN_BARREL_FAILURE));
                }
                if (thisIndex > thatIndex) {
                    if (thisSource.source === thatSource.source) {
                        failures.push(_this.createFailure(thisSource.start, thisSource.width, Rule.DUPLICATE_SOURCE_FAILURE));
                    }
                    if (thisSource.isExternal && !thatSource.isExternal) {
                        failures.push(_this.createFailure(thisSource.start, thisSource.width, Rule.EXTERNAL_BEFORE_INTERNAL_FAILURE));
                        hasOrderFailure = true;
                    }
                    if (thisSource.isExternal && thatSource.isExternal && thisSource.source < thatSource.source) {
                        failures.push(_this.createFailure(thisSource.start, thisSource.width, Rule.EXTERNAL_RULES_ALPHABETICAL_FAILURE));
                    }
                }
            });
        });
        if (!hasOrderFailure && internalSources.length && externalSources.length) {
            if (!internalSources[0].prefix.match(/(\r?\n){2}/)) {
                failures.push(this.createFailure(internalSources[0].start, internalSources[0].width, Rule.SEPARATE_EXTERNAL_AND_INTERNAL_FAILURE));
            }
        }
        return failures;
    };
    FooditOrderedImportsWalker.prototype.isInvalidImportFrom = function (nodeText) {
        if (!this.allowImportEquals.length) {
            return true;
        }
        var match = nodeText.match(/=\s*([^.]+)?/i);
        return !match || !match[1] || this.allowImportEquals.indexOf(match[1]) < 0;
    };
    return FooditOrderedImportsWalker;
}(Lint.RuleWalker));
