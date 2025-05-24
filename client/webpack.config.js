import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import dotenv from "dotenv";
import webpack from "webpack";
import fs from "fs";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

// Get the current directory using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const key = fs.readFileSync(process.env.SSL_KEY_FILE, "utf8");
const cert = fs.readFileSync(process.env.SSL_CRT_FILE, "utf8");

export default {
  entry: "./index.tsx",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "index_bundle.js",
    publicPath: "/",
  },
  target: "web",
  devServer: {
    port: 8080,
    server: {
      type: "https",
      options: {
        key,
        cert,
      },
    },
    static: [
      {
        directory: path.join(__dirname, "public"),
        publicPath: "/",
      },
      {
        directory: path.join(__dirname, "src"),
        publicPath: "/src",
      },
    ],
    open: true,
    hot: true,
    liveReload: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "[name].[hash:8].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]",
        },
      },
      {
        test: /\.obj$/,
        use: [
          {
            loader: "raw-loader",
          },
        ],
        type: "javascript/auto",
      },
      {
        test: /\.json$/,
        type: "javascript/auto",
        use: [
          {
            loader: "json-loader",
          },
        ],
      },
      {
        test: /\.wav$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "audio/[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new NodePolyfillPlugin(),
    new MiniCssExtractPlugin({
      filename: "all.css",
    }),
    new MonacoWebpackPlugin({
      languages: [],
      features: [],
    }),
  ],
};
