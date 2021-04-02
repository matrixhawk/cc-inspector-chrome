const Path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
let ChromeManifest = require('./core/chrome-manifest');

if (process.env.NODE_ENV === 'production') {

}

let resolve = function (dir) {
  return Path.join(__dirname, dir);
};

let htmlPage = function (title, filename, chunks, template) {
  return new HtmlWebpackPlugin({
    title: title,
    hash: true,
    cache: true,
    inject: 'body',
    filename: './pages/' + filename + '.html',
    template: template || Path.resolve(__dirname, 'core/page.ejs'),
    appMountId: 'app',
    chunks
  });
};

module.exports = {
  mode: 'development',
  entry: {
    // test: resolve('test'),
    background: resolve('background'),
    inject: resolve('content/inject'),

    // devInspector: path.resolve(__dirname, './src/dev/devInspector/main.js'),
    // dev: path.resolve(__dirname, './src/dev/dev.js'),
    // index: path.resolve(__dirname, './src/index/main.js'),
    // backgroundScripts: path.resolve(__dirname, './src/dev/backgroundScripts.js'),
    // contentScripts: path.resolve(__dirname, './src/dev/contentScripts.js'),
    // util: path.resolve(__dirname, './src/dev/util.js'),
    // injectScript: path.resolve(__dirname, './src/dev/injectScript.js'),
  },
  output: {
    path: Path.resolve(__dirname, 'build'),
    publicPath: '/',
    filename: 'js/[name].js'
  },
  plugins: [
    new VueLoaderPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
    // webpack 执行之前删除dist下的文件
    new CleanWebpackPlugin(['./build/*'], {
      root: __dirname,//根目录
      verbose: true,//开启在控制台输出信息
      dry: false,//启用删除文件
    }),

    htmlPage('background', 'background', ['background']),
    new ChromeManifest({
      outFile: Path.join(__dirname, 'build/manifest.json'),
      manifest: Path.join(__dirname, 'manifest.js')
    }),
    //index.html
    // new HtmlWebpackPlugin({
    //   template: __dirname + "/src/index/index.html",
    //   filename: 'index.html',
    //   inject: 'body',
    //   chunks: ['index']
    // }),


    //dev.html
    // new HtmlWebpackPlugin({
    //   template: __dirname + "/src/dev/dev.html",
    //   filename: 'dev.html',
    //   inject: 'body',
    //   chunks: ['dev']
    // }),

    //devInspector.html
    // new HtmlWebpackPlugin({
    //   template: __dirname + "/src/dev/devInspector/devInspector.html",
    //   filename: 'devInspector.html',
    //   inject: 'body',
    //   chunks: ['devInspector']
    // }),

    // 拷贝静态资源(manifest.json)
    new CopyWebpackPlugin([{
      from: Path.resolve(__dirname, 'icon'),
      to: 'icon',
      force: true,
      // ignore: ['.*']
    }]),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: '"production"'
    //   }
    // }),
    // new webpack.optimize.UglifyJsPlugin({
    //   sourceMap: true,
    //   compress: {
    //     warnings: false
    //   }
    // }),
    // new webpack.LoaderOptionsPlugin({
    //   minimize: true
    // })
  ],
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.less$/,
        use: [
          'less-loader'
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            scss: 'style-loader!css-loader!sass-loader',
            sass: 'style-loader!css-loader!sass-loader?indentedSyntax',
            less: 'less-loader'
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      // {
      //   test: /\.(png|jpg|gif|svg|ttf|woff|woff2|eot)$/,
      //   loader: 'file-loader',
      //   options: {
      //     name: '[name].[ext]?[hash]'
      //   }
      // },
      {
        test: /\.(png|jpg|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.ts', '.js', '.vue', '.json']
  },
  devServer: {
    contentBase: './dist',//本地服务器所加载的页面所在的目录
    historyApiFallback: true,//不跳转
    noInfo: true,
    inline: true,//实时刷新
    overlay: true
  },

  performance: {
    hints: false
  },
  devtool: '#source-map'
};


