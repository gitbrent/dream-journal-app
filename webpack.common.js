const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

// `process.env` depends upon this setup
const webpack = require('webpack');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const envKeys = Object.keys(env).reduce((prev, next) => {
	prev[`process.env.${next}`] = JSON.stringify(env[next]);
	return prev;
}, {});

module.exports = {
	entry: "./src/app/app.tsx",
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: "src/templates/index.html",
		}),
		new webpack.DefinePlugin(envKeys),
	],
	output: {
		path: __dirname + "/public",
		filename: "build/[name].[contenthash].js",
		publicPath: "/",
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"],
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: /(node_modules|bower_components)/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env", "@babel/preset-react"],
							plugins: ["@babel/plugin-proposal-class-properties"],
						},
					},
				],
			},
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: "ts-loader",
					},
				],
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: "style-loader",
					},
					{
						loader: "css-loader",
					},
				],
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					"style-loader",
					// Translates CSS into CommonJS
					"css-loader",
					// Compiles Sass to CSS
					//"sass-loader",
					{
						loader: "sass-loader",
						options: {
							sassOptions: { quietDeps: true }
						}
					}
				],
			},
			{
				test: /\.json$/,
				use: [{ loader: "json-loader" }],
			},
			{
				test: /\.svg$/,
				exclude: /(node_modules|bower_components)/,
				use: [
					{
						loader: "svg-inline-loader?classPrefix",
						options: {
							jsx: true, // true outputs JSX tags
						},
					},
				],
			},
			{
				test: /\.(gif|png|jpe?g|svg)$/i,
				use: [
					{
						loader: "file-loader",
					},
					{
						loader: "image-webpack-loader",
						options: {
							bypassOnDebug: true, // webpack@1.x
							disable: true, // webpack@2.x and newer
						},
					},
				],
			},
		],
	},
	devServer: {
		open: true,
		historyApiFallback: true,
		static: path.join(__dirname, "public"),
		compress: true,
		port: 8080,
	}
};
