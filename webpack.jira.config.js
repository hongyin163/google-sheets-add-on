const path = require('path');
const minimist = require('minimist');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const argv = minimist(process.argv.slice(2));
const name = argv.name;

function getCssLoaders(importLoaders) {
  return [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: false,
        sourceMap: false,
        importLoaders
      }
    },
    {
      loader: 'postcss-loader',
      options: { sourceMap: true }
    }
  ];
}

module.exports = {
  mode: 'production',
  entry: `./node_modules/jira.js/out/version2/index.js`,
  output: {
    path: path.resolve(__dirname, `static/_share/jira`),
    filename: 'jira.js',
    // publicPath: `http://localhost:9000/${name}/dist`,
    library: {
      name: 'JiraVersion2',
      type: 'umd',
      umdNamedDefine: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$|\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      {
        test: /\.css$/,
        use: getCssLoaders(1)
      },
      {
        test: /\.less$/,
        use: [
          // postcss-loader + less-loader 两个 loader，所以 importLoaders 应该设置为 2
          ...getCssLoaders(2),
          {
            loader: 'less-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          ...getCssLoaders(2),
          {
            loader: 'sass-loader',
            options: { sourceMap: false }
          }
        ]
      }
    ],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDom',
    lodash: '_',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      os: require.resolve('os-browserify/browser'),
      buffer: false,
      child_process: false,
      path: false,
      assert: false,
      crypto: false,
      url: false,
      http: false,
      https: false,
      querystring: false,
      stream: false,
      fs: false,
      zlib: false,
      tty: false,
      util: false,
    },
  },
};
