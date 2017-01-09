import * as ts from "typescript";
import * as Lint from 'tslint/lib/lint';
import {AbstractRule} from 'tslint/lib/language/rule/abstractRule';

export class Rule extends AbstractRule {
  public static EXTERNAL_BEFORE_INTERNAL_FAILURE = 'External imports should appear before internal imports.';
  public static EXTERNAL_RULES_ALPHABETICAL_FAILURE = 'External imports should be ordered alphabetically.';
  public static IMPORTS_CONTAINED_IN_BARREL_FAILURE = 'Multiple imports from a single folder should be grouped with a barrel file.';
  public static SEPARATE_EXTERNAL_AND_INTERNAL_FAILURE = 'Internal sources should be separated from external sources by a blank line.';
  public static IMPORT_EQUALS_FAILURE = 'Use "import from" instead of "import equals".';
  public static DUPLICATE_SOURCE_FAILURE = 'Duplicate import source.';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const orderedImportsWalker = new FooditOrderedImportsWalker(sourceFile, this.getOptions());
    this.applyWithWalker(orderedImportsWalker);

    return orderedImportsWalker.getFailures();
  }
}

function getParent(source: string): string {
  if (source.match(/^\.\.?\//)) {
    // Local imports have no parents
    return null;
  }
  let firstSlash = source.indexOf('/');
  if (firstSlash < 0) {
    return source;
  }
  return source.substring(0, firstSlash);
}

function isExternal(source: string): boolean {
  return !!getParent(source); // Only external files have a parent
}

function normalise(source: string): string {
  source = source.toLowerCase();
  source = source.replace(/(^['"]|['"]$)/gi, '');
  return source;
}

function isContained(importSource: string, barrelSource: string): boolean {
  if (isExternal(importSource) || isExternal(barrelSource)) {
    return false; // This method is for internal files only
  }
  return barrelSource.length > importSource.length && barrelSource.indexOf(importSource + '/') === 0;
}

interface Source {
  source: string;
  start: number;
  width: number;
  isExternal: boolean;
  prefix: string;
}

class FooditOrderedImportsWalker extends Lint.RuleWalker {

  private sources: Source[];
  private allowImportEquals: string[];

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    if (options.ruleArguments.length) {
      this.allowImportEquals = options.ruleArguments[0]['allow-import-equals'] || [];
    } else {
      this.allowImportEquals = [];
    }

    this.sources = [];
  }

  // e.g. "import Foo from "./foo";"
  public visitImportDeclaration(node: ts.ImportDeclaration) {
    const prefixLength = node.getStart() - node.getFullStart();
    const prefix = node.getFullText().slice(0, prefixLength);
    const source = normalise(node.moduleSpecifier.getText());
    this.sources.push({
      source,
      start: node.getStart(),
      width: node.getWidth(),
      isExternal: isExternal(source),
      prefix
    });

    super.visitImportDeclaration(node);
  }

  // e.g. "import ElementFinder = protractor.ElementFinder;"
  public visitImportEqualsDeclaration(node: ts.ImportEqualsDeclaration) {
    if (this.isInvalidImportFrom(node.getText())) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.IMPORT_EQUALS_FAILURE));
    }

    super.visitImportEqualsDeclaration(node);
  }

  public getFailures(): Lint.RuleFailure[] {
    let failures = super.getFailures().slice();
    if (!this.sources.length) {
      return failures;
    }

    const internalSources = this.sources.filter((source: Source) => !source.isExternal);
    const externalSources = this.sources.filter((source: Source) => source.isExternal);
    let hasOrderFailure: boolean = false;

    this.sources.forEach((thisSource: Source, thisIndex: number) => {
      this.sources.forEach((thatSource: Source, thatIndex: number) => {
        if (thisIndex === thatIndex) {
          return;
        }
        if (isContained(thisSource.source, thatSource.source)) {
          failures.push(this.createFailure(thisSource.start, thisSource.width, Rule.IMPORTS_CONTAINED_IN_BARREL_FAILURE));
        }
        if (thisIndex > thatIndex) {
          if (thisSource.source === thatSource.source) {
            failures.push(this.createFailure(thisSource.start, thisSource.width, Rule.DUPLICATE_SOURCE_FAILURE));
          }
          if (thisSource.isExternal && !thatSource.isExternal) {
            failures.push(this.createFailure(thisSource.start, thisSource.width, Rule.EXTERNAL_BEFORE_INTERNAL_FAILURE));
            hasOrderFailure = true;
          }
          if (thisSource.isExternal && thatSource.isExternal && thisSource.source < thatSource.source) {
            failures.push(this.createFailure(thisSource.start, thisSource.width, Rule.EXTERNAL_RULES_ALPHABETICAL_FAILURE));
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
  }

  private isInvalidImportFrom(nodeText: string): boolean {
    if (!this.allowImportEquals.length) {
      return true;
    }

    const match = nodeText.match(/=\s*([^.]+)?/i);
    return !match || !match[1] || this.allowImportEquals.indexOf(match[1]) < 0;
  }
}
