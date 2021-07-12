//Bündelt index.js und alle darin referenzierten Module und speichert das minified Ergebnis in main.js
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },

    //setzt das Root Verzeichnis des Webpack Development Servers auf einen Ordner
    devServer: {
        contentBase: 'dist',
    },

    module: {
        rules: [{
            test: /\.pegjs$/,
            use: 'pegjs-loader'
        }]
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'src/index.html', to: '' },
            ],
        }),
    ],
};