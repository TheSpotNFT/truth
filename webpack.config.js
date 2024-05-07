module.exports = {
  resolve: {
    extensions: [".js", ".css", ".jsx"],
    alias: {
      // add as many aliases as you like!
      components: path.resolve(__dirname, "src/components"),
    },
    fallback: {
      //   stream: require.resolve("stream-browserify"),
      //   assert: require.resolve("assert"),
      //   http: require.resolve("stream-http"),
      //   https: require.resolve("https-browserify"),
      //   url: require.resolve("url"),
      //   os: require.resolve("os-browserify/browser"),
      //   crypto: require.resolve("crypto-browserify"),
      stream: false,
      assert: false,
      http: false,
      https: false,
      url: false,
      os: false,
      crypto: false,
    },
    plugins: [
      new webpack.DefinePlugin({
        process: "process/browser",
      }),
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    ],
  },
};
