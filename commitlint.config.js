module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^([A-Z][A-Z]*)((\s[^\s]+)+)$/,
      headerCorrespondence: ['type', 'subject']
    }
  },
  rules: {
    'header-max-length': [1, 'always', 72],
    'scope-empty': [2, 'always'],
    'type-enum':[ 2, 'never', [ ] ],
    'type-case':[ 2, 'always', 'upper-case' ],
    'type-max-length': [1, 'always', 10]
  }
};
