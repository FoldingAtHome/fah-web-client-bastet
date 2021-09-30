module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    "vue/max-attributes-per-line": 'off',
    "max-len": ['error', { code: 120, ignoreUrls: true, ignoreComments: true }],
    "vue/html-closing-bracket-newline": ["error", {
      "singleline": "never",
      "multiline": "never"
    }],
    "vue/singleline-html-element-content-newline": 'off'
  }
}
