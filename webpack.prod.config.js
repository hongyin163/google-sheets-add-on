const webpack = require('webpack');
const path = require('path');
const minimist = require('minimist');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const package = require('./package.json');

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
      options: { sourceMap: false }
    }
  ];
}

module.exports = {
  mode: 'production',
  entry: `./static/${name}/index.tsx`,
  output: {
    path: path.resolve(__dirname, `static/${name}/dist`),
    filename: 'index.js',
    publicPath: `http://localhost:15050/${name}/dist`,
    // library: {
    //   name: "JiraVersion2",
    //   type: "umd",
    //   umdNamedDefine: true,
    // },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'static'),
    },
    // compress: true,
    port: 9000,
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
    'react-dom': 'ReactDOM',
    'jira.js': 'JiraVersion2',
    lodash: '_',
    'jira.js/out/version2':'JiraVersion2',
    'firebase/app':'firebaseApp',
    'firebase/analytics':'firebaseAnalytics',
    'firebase/firestore':'firebaseFirestore',
    'firebase/auth':'firebaseAuth'
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
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(package.version),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: `static/${name}/index.html`,
      inject:'body',
      scriptLoading:'module'
    }),
    new HtmlInlineScriptPlugin(),
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            { source: path.resolve(__dirname, `static/${name}/dist/index.html`), destination: path.resolve(__dirname, `static/_gs/${name}.html`) },
          ],
        }
      }
    })
  ],
};
