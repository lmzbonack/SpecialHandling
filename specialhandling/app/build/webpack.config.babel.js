/* global __dirname */

import webpack from 'webpack';
import { resolve } from 'path';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import BundleTrackerPlugin from 'webpack-bundle-tracker';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import chalk from 'chalk'; //For loading bar colors :D
import { getIfUtils, removeEmpty } from 'webpack-config-utils';

// Polyfills for older ipads
import 'babel-polyfill';

console.log('┌─────────────────────────────┐');
console.log('│Who\'s ready to pack some web?│');
console.log('└─────────────────────────────┘\n');

export default env => {
    const { ifProduction, ifNotProduction } = getIfUtils(env);
    return {
        entry: [
            'babel-polyfill',
            './app/app.js'
        ],
        output: {
            path: resolve(__dirname, '../../', 'specialhandling/static/js'),
            filename: ifProduction('[name].[hash].js', '[name].js')
        },
        watch: ifNotProduction(true),
        devtool: ifProduction('cheap-module-source-map', 'cheap-module-eval-source-map'),
        module: {
            rules: removeEmpty([
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader'
                    },
                    exclude: /node_modules/
                },
                {
                    test: /\.scss$/,
                    use: [
                        { loader: 'style-loader', options: { sourceMap: true } },
                        { loader: 'css-loader', options: { sourceMap: true } },
                        { loader: 'postcss-loader', options: { sourceMap: true } },
                        { loader: 'sass-loader', options: { sourceMap: true } }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        { loader: 'style-loader', options: { sourceMap: true } },
                        { loader: 'css-loader', options: { sourceMap: true } },
                        { loader: 'postcss-loader', options: { sourceMap: true } },
                    ]
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            js: 'babel-loader',
                            css: 'vue-style-loader!css-loader',
                            scss: 'vue-style-loader!css-loader!postcss-loader!sass-loader'
                        }
                    }
                },
                {
                    test: /\.svg$/,
                    loader: 'url-loader'
                }
            ])
        },
        resolve: {
            alias: {
                'vue$': resolve(__dirname, '../..', 'node_modules/vue/dist/vue.esm.js'),
                'bootstrap': resolve(__dirname, '../..', 'node_modules/bootstrap'),
                '@': resolve(__dirname, '../..', 'app'),
                '~': resolve(__dirname, '../..', 'node_modules')
            }
        },
        plugins: removeEmpty([
            new webpack.HotModuleReplacementPlugin(),
            new FriendlyErrorsWebpackPlugin(),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                jquery: "jquery",
                "window.jQuery": "jquery",
                Tether: "tether",
                "window.Tether": "tether",
                Alert: "exports-loader?Alert!bootstrap/js/dist/alert",
                Button: "exports-loader?Button!bootstrap/js/dist/button",
                Carousel: "exports-loader?Carousel!bootstrap/js/dist/carousel",
                Collapse: "exports-loader?Collapse!bootstrap/js/dist/collapse",
                Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
                Modal: "exports-loader?Modal!bootstrap/js/dist/modal",
                Popover: "exports-loader?Popover!bootstrap/js/dist/popover",
                Scrollspy: "exports-loader?Scrollspy!bootstrap/js/dist/scrollspy",
                Tab: "exports-loader?Tab!bootstrap/js/dist/tab",
                Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
                Util: "exports-loader?Util!bootstrap/js/dist/util"
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: ifProduction('"production"', '"development"'),
                },
                SENTRY_DSN_PROD: ifProduction(JSON.stringify('https://c927b3ffe09f46f598e700feccbcde46@sentry.fso.arizona.edu/38')),
                SENTRY_DSN_DEV: ifProduction(JSON.stringify('https://0d8124a0a8114bacb2f8158b05fc523e@sentry.fso.arizona.edu/36'))
            }),
            ifProduction(new BundleTrackerPlugin({
                filename: 'asset-manifest.json',
                path: resolve(__dirname, '../../', 'specialhandling/static/js')
            })),
            ifProduction(new ProgressBarPlugin({
                format: ' Building... [:bar] ' +
                    chalk.green.bold(':percent') +
                    chalk.yellow.bold(' (:elapsed seconds)'),
                clear: false
            })),
            ifProduction(new UglifyJsPlugin({
                uglifyOptions: {
                    ie8: false
                },
                sourceMap: true
            })),
            ifProduction(new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: function (module) {
                    return module.context && module.context.indexOf('node_modules') !== -1;
                }
            }))
        ])
    };
};
