const path = require('path');

const merge = require('webpack-merge');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    optimization: {
        splitChunks: {
            chunks: 'async',
            name: true,
            cacheGroups: {
                commons: {
                    name: 'commons',
                    chunks: 'initial',
                    minChunks: 2
                }
            }
        },
        minimize: true,
        runtimeChunk: 'single',
        moduleIds: 'named',
        nodeEnv: 'development',
        mangleWasmImports: false,
        flagIncludedChunks: true,
        occurrenceOrder: true,
        usedExports: true,
        concatenateModules: true,
        sideEffects: true,
        portableRecords: true
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        importLoaders: 2
                    }
                },
                "postcss-loader",
                {
                    loader: "sass-loader",
                    options: {
                        includePaths: [path.join(__dirname, "node_modules")],
                        workerParallelJobs: 2
                    }
                }
            ]
        }]
    }
});