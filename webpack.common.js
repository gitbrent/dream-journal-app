const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
	entry: "./src/app/app.tsx",
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: "src/templates/index.html",
		}),
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
		contentBase: path.join(__dirname, "public"),
		compress: true,
		port: 9000,
	},
};
