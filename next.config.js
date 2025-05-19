// next.config.js
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const nextConfig = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'ruby'],
        })
      );
    }

    return config;
  }
};

module.exports = nextConfig;
