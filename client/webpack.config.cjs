const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
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
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) return middlewares;

      // Redirect requests for .data files
      devServer.app.get(
        "/face_mesh_solution_packed_assets.data",
        (req, res, next) => {
          res.redirect(
            "/@mediapipe/face_mesh/face_mesh_solution_packed_assets.data"
          );
        }
      );

      return middlewares;
    },
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
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
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
  ],
};
