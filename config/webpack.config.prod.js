const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const env = process.env.NODE_ENV

const outputPath = path.resolve(__dirname, '../static')

function recursiveFindFiles(dir, result) {
  const files = fs.readdirSync(dir)
  for (let file of files) {
    const p = path.join(dir, file)
    const stat = fs.statSync(p)
    if (stat.isFile()) {
      if (file.endsWith('.less') ||
        (file.endsWith('.js') && !file.endsWith('.node.js') && !file.endsWith('.wp.js'))) {
        result[file] = p
      }
    } else if (stat.isDirectory()) {
      recursiveFindFiles(p, result)
    }
  }
}

const entry = {}
recursiveFindFiles(path.resolve(__dirname, '../app/pages'), entry)
console.log(entry)

class CopyFilesBackToViewsPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      'CopyFilesBackToViewsPlugin',
      (compilation, next) => {
        console.log('CopyFilesBackToViewsPlugin:')
        for (let asset in compilation.assets) {
          if (asset.endsWith('.less')) {
            const entryFile = entry[asset]
            const targetFileDir = path.dirname(entryFile)
            const cssFileName = asset.substring(0, asset.length - 4) + 'css'
            const src = path.join(outputPath, cssFileName)
            const dist = path.join(targetFileDir, cssFileName)
            console.log('copy ' + src + ' to ' + dist)
            fs.copyFile(src, dist,
              err => {
                err && console.log(err)
              })
          } else if (asset.endsWith('.in.js')) {
            const entryFile = entry[asset]
            const targetFileDir = path.dirname(entryFile)
            const cssFileName = asset.substring(0, asset.length - 2) + 'wp.js'
            const src = path.join(outputPath, asset)
            const dist = path.join(targetFileDir, cssFileName)
            console.log('copy ' + src + ' to ' + dist)
            fs.copyFile(src, dist,
              err => {
                err && console.log(err)
              })
          } else if (asset.endsWith('.js')) {
            const src = path.join(outputPath, asset)
            const dist = path.join(__dirname, '../app/public/js', asset)
            console.log('copy ' + src + ' to ' + dist)
            fs.copyFile(src, dist,
              err => {
                err && console.log(err)
              })
          }
        }

        next()
      }
    )
  }
}

const config = {
  mode: 'production',
  entry: entry,
  output: {
    path: outputPath,
    filename: '[name]',
    chunkFilename: '[name].chunk'
  },
  plugins: [
    new CleanWebpackPlugin(['static'], {
      root: path.join(__dirname, '../'),
      dry: false
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    new CopyFilesBackToViewsPlugin()
  ],
  externals: {
    jquery: 'window.$',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015']
          }
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].css'
            }
          },
          'extract-loader',
          'css-loader',
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              plugins: () => [
                autoprefixer({
                  browsers: [
                    'ios >= 7',
                    'android >= 4',
                    'ie >= 9',
                  ]
                }),
                cssnano({
                  preset: 'default'
                })
              ],
            },
          },
          'less-loader'
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          ecma: 5,
          warnings: false,
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          output: {
            comments: false,
            beautify: false
          },
          toplevel: false,
          nameCache: null,
          ie8: true,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
        }
      })
    ]
  },
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  }
}

module.exports = config
