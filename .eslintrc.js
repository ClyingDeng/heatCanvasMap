/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': 'off',
    'vue/no-v-model-argument': 'off',
    'no-use-before-define': 'off',
    'prefer-rest-params': 0,
    'prettier/prettier': [
      'warn',
      {
        printWidth: 120,
        endOfLine: 'auto',
        htmlWhitespaceSensitivity: 'ignore', // 指定 HTML 文件的全局空白区域敏感度。空格被认为是不敏感的
        singleQuote: true, // 单引号
        semi: false, // 语句末尾打印分号。不加
        trailingComma: 'none', // 多行时尽可能打印尾随逗号。不尾随
        bracketSpacing: true, // 括号之间的空格
        jsxBracketSameLine: true // 将 > 多行 JSX 元素放在最后一行的末尾
      }
    ],
    indent: [
      2,
      2,
      {
        SwitchCase: 1
      }
    ],
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-restricted-globals': 'off',
    'no-restricted-properties': 'off',
    '@typescript-eslint/await-thenable': 'off',
    'no-useless-escape': 'off',
    'no-undef': 'off',
    'vue/no-unused-vars': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-template-shadow': 'off'
  },
}
