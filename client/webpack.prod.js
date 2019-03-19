const path = require('path');

const merge = require('webpack-merge');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: true,
            cacheGroups: {
                commons: {
                    name: 'commons',
                    chunks: 'all',
                    minChunks: 2
                }
            }
        },
        minimize: true,
        runtimeChunk: 'single',
        moduleIds: 'hashed',
        nodeEnv: 'production',
        mangleWasmImports: true,
        flagIncludedChunks: true,
        occurrenceOrder: true,
        providedExports: true,
        usedExports: true,
        concatenateModules: true,
        sideEffects: true,
        portableRecords: true
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: "css-loader",
                    options: {
                        importLoaders: 2
                    }
                },
                "postcss-loader"
            ]
        }, {
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
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
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css",
            chunkFilename: "[id].[contenthash].css"
        }),
        new CompressionPlugin({
            filename: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0
        })
    ]
});