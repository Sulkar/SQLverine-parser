//Bündelt index.js und alle darin referenzierten Module und speichert das minified Ergebnis in main.js
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


module.exports = {
    entry: './src/index.js',

    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },

    //setzt das Root Verzeichnis des Webpack Development Servers auf einen Ordner
    devServer: {
        static: path.join(__dirname, "dist"),
      },
      
    devtool:"source-map",

    module: {
        rules: [
 
        {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
          }
        ]
    },
  
    resolve: {

        fallback: {
            "fs": false,
            "path": false,
            "crypto": false,
        },
        alias: {
            // nutzt für jeden jQuery, bootstrap Import das hier im Repo liegenden Modul, damit diese nicht doppelt gepackt werden!!
            'jquery': __dirname + '/node_modules/jquery/',
            'bootstrap': __dirname + '/node_modules/bootstrap/',            
        },
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'src/index.html', to: '' },
                { from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: '' },
                { from: '../SQLverine/src/activeCodeViewData.json', to: 'data' },
                { from: 'src/data', to: 'data' },
            ],           
        }),
        new MiniCssExtractPlugin(),
    ],
};