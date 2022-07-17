/**
 * @see https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md
 * @see https://dev.to/knowankit/setup-eslint-and-prettier-in-react-app-357b
 */

module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: ["eslint:recommended", "plugin:react/recommended", "plugin:@typescript-eslint/recommended"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: "latest",
		sourceType: "module",
		project: ["./tsconfig.json"],
	},
	plugins: ["react", "@typescript-eslint"],
	ignorePatterns: [".eslintrc.js"],
	rules: {
		indent: ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "single"],
		semi: ["error", "never"],
		"@typescript-eslint/naming-convention": [
			"warn",
			{
				selector: "interface",
				modifiers: ["exported"],
				format: ["PascalCase"],
				prefix: ["I"],
			},
			{
				selector: "enum",
				format: ["PascalCase"],
			},
			{
				selector: "function",
				modifiers: ["exported"],
				format: ["PascalCase"],
			},
			{
				selector: "function",
				format: ["camelCase"],
			},
			{
				selector: "typeProperty",
				format: ["camelCase"],
			},
			/* NOTE: works, but do we want this?
			{
				selector: "variable",
				modifiers: ["const"],
				format: ["PascalCase", "UPPER_CASE"],
			},
			*/
			{
				selector: "variable",
				format: ["camelCase", "UPPER_CASE"],
			},
			{
				selector: "variable",
				types: ["boolean"],
				format: ["camelCase", "UPPER_CASE"],
				prefix: ["is", "should", "has", "can", "did", "will", "show"],
			},
			{
				selector: "memberLike",
				modifiers: ["private"],
				format: ["camelCase"],
				leadingUnderscore: "require",
			},
		],
	},
};
