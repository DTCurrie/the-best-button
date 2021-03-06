const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const {
    BundleAnalyzerPlugin
} = require('webpack-bundle-analyzer');

const {
    TsConfigPathsPlugin
} = require('awesome-typescript-loader');

module.exports = {
    entry: {
        main: ['./src/Index.tsx'],
        polyfill: ['./src/polyfill.ts'],
        styles: ['./src/styles/styles.scss']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.[hash].js',
        chunkFilename: '[name].chunk.[hash].js',
        publicPath: '/'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            'react-hot-loader': path.resolve(path.join(__dirname, './node_modules/react-hot-loader')),
            react: path.resolve(path.join(__dirname, './node_modules/react')),
        },
        plugins: [
            new TsConfigPathsPlugin()
        ]
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: [{
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets: {
                                        node: "current",
                                        browsers: "last 2 versions"
                                    }
                                }
                            ],
                            "@babel/preset-typescript",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-class-properties", {
                                loose: true
                            }],
                            "react-hot-loader/babel",
                            "syntax-dynamic-import"
                        ]
                    }
                },
                "react-hot-loader/webpack",
                "tslint-loader"
            ],
        }, {
            enforce: "pre",
            test: /\.js$/,
            loader: "source-map-loader"
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new ForkTsCheckerWebpackPlugin({
            checkSyntacticErrors: true
        }),
        new HtmlWebpackPlugin({
            title: "The Best Button",
            template: path.join(__dirname, 'src', 'index.html')
        }),
        new BundleAnalyzerPlugin()
    ]
};