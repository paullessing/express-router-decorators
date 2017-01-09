# Custom TSLint rules

This folder contains custom TSLint rules.
They are enabled by taking their name and turning it into kebab-case, minus the trailing "Rule".

_Please Note:_ The `.js` files in this folder are generated but are committed to avoid having to re-compile them before every tslint run.
**Please do not delete the `.js` files!**

## How to create a new rule
 1. Create a file called `*Rule.ts`
 2. Use the structure from one of the existing rules; you must export a value called `Rule`
 3. Compile using `tsc tslint/yourNewRule.ts --module commonjs --removeComments`
 4. Add the rule in kebab-case to `tslint.json` as usual.
 5. Ensure you add the generated `.js` files to the commit.
