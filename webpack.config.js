const path = require('path');
const { readFileSync } = require('fs');
const { yamlParse } = require('yaml-cfn');
const nodeExternals = require('webpack-node-externals');
const glob = require('glob');
const R = require('ramda');
const pkg = require('./package.json');
const InjectPlugin = require('webpack-inject-plugin').default;

const conf = {
    prodMode: process.env.NODE_ENV === 'production',
    templatePath: './sam/template.yml'
};
const templatePaths = glob.sync('./sam/**/*.yml');
const resources = templatePaths
    .map(path => yamlParse(readFileSync(path)))
    .map(template => template)
    .reduce((acc, current) => R.mergeDeepLeft(acc, current), {});

const entries = Object.values(resources.Resources)
    // Find nodejs functions
    .filter(v => v.Type === 'AWS::Serverless::Function')
    .filter(
        v =>
            (v.Properties.Runtime && v.Properties.Runtime.startsWith('nodejs')) ||
            (!v.Properties.Runtime && resources.Globals.Function.Runtime)
    )
    .map(v => ({
        // Isolate handler src filename
        handlerFile: v.Properties.Handler.split('.')[0],
        // Build handler dst path
        CodeUriDir: v.Properties.CodeUri.split('/').splice(2).join('/')
    }))
    .reduce(
        (entries, v) =>
            Object.assign(
                entries,
                // Generate {outputPath: inputPath} object
                {
                    [`${v.CodeUriDir}/${v.handlerFile}`]: `./src/lambdas/${v.CodeUriDir}/${v.handlerFile}.ts`
                }
            ),
        {}
    );

console.log(`Building for ${conf.prodMode ? 'production' : 'development'}...`);
console.log(entries);

module.exports = {
    entry: entries,
    target: 'node',
    devtool: 'source-map',
    externals: conf.prodMode ? [nodeExternals()] : [],
    mode: conf.prodMode ? 'production' : 'development',
    plugins: [new InjectPlugin(() => `global.DOMAIN = '${pkg.name}';`)],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: ['/node_modules/aws-sdk']
            }
        ]
    },
    optimization: {
        minimize: false
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    }
};
