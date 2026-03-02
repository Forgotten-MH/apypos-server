import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/', 'scripts/', 'frida/', 'node_modules/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { arguments: false } },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true, allowNullish: true },
      ],
      '@typescript-eslint/restrict-plus-operands': [
        'error',
        { allowNumberAndString: true, allowAny: true },
      ],
      // `return encryptAndSend(...)` is an intentional early-return pattern throughout controllers
      '@typescript-eslint/no-confusing-void-expression': 'off',
      // Mongoose runtime types don't always match TS static types
      '@typescript-eslint/no-unnecessary-condition': 'off',
      // Used intentionally after length/existence checks and with noUncheckedIndexedAccess
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  // Relax rules for test files
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
);
