module.exports = {
    hooks: {
      'pre-commit': 'lint-staged --relative',
      'pre-push': 'npm test'
    }
};
