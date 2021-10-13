const { CLIEngine } = require('eslint');

const cli = new CLIEngine({});

module.exports = {
  '*.{js,ts}': (files) => 'eslint --ext .js,.ts ' + files.filter(file => !cli.isPathIgnored(file)).join(' ')
};
