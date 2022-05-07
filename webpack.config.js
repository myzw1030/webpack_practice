const path = require('path'); //pathの読み込み
const globule = require("globule"); //globule の読み込み
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

// 本番環境のときはsoucemapを出力させない設定
const enabledSourceMap = process.env.NODE_ENV !== "production";

const app = {
    entry: './src/js/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/main.js',
    },
    mode: "development",
    //仮想サーバーの設定
    devServer: {
        static: "dist",
        // contentBase: path.join(__dirname, "dist"), //ルートディレクトリの指定
        open: true, //ブラウザを自動的に起動
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                ],
            },
            {
                // 対象となるファイルの拡張子(scssかsassかcss)
                test: /\.(css|sass|scss)/,
                // Sassファイルの読み込みとコンパイル
                use: [
                    // CSSファイルを抽出するように MiniCssExtractPlugin のローダーを指定
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    // CSSをバンドルするためのローダー
                    {
                        loader: 'css-loader',
                        options: {
                            // production モードでなければソースマップを有効に
                            sourceMap: enabledSourceMap,
                        },
                    },
                    // PostCSS（autoprefixer）の設定
                    {
                        loader: "postcss-loader",
                        options: {
                            // production モードでなければソースマップを有効に
                            sourceMap: enabledSourceMap,
                            postcssOptions: {
                                // ベンダープレフィックスを自動付与
                                plugins: [require("autoprefixer")({ grid: true })]
                            },
                        },
                    },
                    // Sass を CSS へ変換するローダー
                    {
                        loader: 'sass-loader',
                        options: {
                            // dart-sass を優先
                            implementation: require("sass"),
                            //  production モードでなければソースマップを有効に
                            sourceMap: enabledSourceMap
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|jpeg)/,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext]'
                },
                use: [
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.pug/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                    {
                        loader: 'pug-html-loader',
                        options: {
                            pretty: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: './css/main.css', // distの中にあるcssフォルダにstyle.cssを出力
        }),
        new CleanWebpackPlugin(), // dist内の不要なファイルやフォルダを消す
    ],
    //source-map タイプのソースマップを出力
    devtool: false,
}

if (process.env.NODE_ENV !== 'production') {
    module.exports.devtool = 'inline-source-map';
}

//srcフォルダからpngを探す
const templates = globule.find("./src/templates/**/*.pug", {
    ignore: ["./src/templates/**/_*.pug"]
});

//pugファイルがある分だけhtmlに変換する
templates.forEach((template) => {
    const fileName = template.replace("./src/templates/", "").replace(".pug", ".html");
    app.plugins.push(
        new HtmlWebpackPlugin({
            filename: `${fileName}`,
            template: template,
            inject: false, //false, head, body, trueから選べる
            minify: false, //本番環境でも圧縮しない
            alwaysWriteToDisk: true,
        }),
        new HtmlWebpackHarddiskPlugin(), // HTMLファイル変更時にホットリロード
    );
});

module.exports = app;
