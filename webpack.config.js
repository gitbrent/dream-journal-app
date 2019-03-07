const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/app/app.tsx",
  mode: "development",
  plugins: [
    new CleanWebpackPlugin(["public/build"]),
    new HtmlWebpackPlugin({
      template: "src/templates/index.html"
    })
  ],
  output: {
    path: __dirname + "/public",
    filename: "build/[name].[contenthash].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.svg$/,
        exclude: /(node_modules|bower_components)/,
        loader: "svg-inline-loader?classPrefix",
        options: {
          jsx: true // true outputs JSX tags
        }
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader",
            options: {
              bypassOnDebug: true, // webpack@1.x
              disable: true // webpack@2.x and newer
            }
          }
        ]
      }
    ]
  }
};
