/**
 * @module rules
 * @description 配置 Webpack 规则
 */

import swcrc from '../../.swcrc.js';
import postcssrc from '../../.postcssrc.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/**
 * @function resolveRules
 * @param {string} mode
 * @return {Promise<NonNullable<import('webpack').Configuration['module']>['rules']>}
 */
export default async mode => {
  const isDevelopment = mode !== 'production';
  const swcOptions = { ...(await swcrc()), swcrc: false };
  const localIdentName = isDevelopment ? '[local]-[hash:8]' : '[hash:8]';
  const postcssOptions = { postcssOptions: { ...(await postcssrc(mode)), config: false } };
  const cssModulesOptions = { auto: true, localIdentName, exportLocalsConvention: 'camel-case-only' };

  return [
    {
      oneOf: [
        // The loader for js.
        {
          test: /\.[jt]sx?$/i,
          exclude: /[\\/]node_modules[\\/]/,
          use: [
            {
              loader: 'swc-loader',
              options: swcOptions
            }
          ]
        },
        // The loader for css.
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
            },
            {
              loader: 'css-loader',
              options: {
                esModule: true,
                importLoaders: 1,
                modules: cssModulesOptions
              }
            },
            {
              loader: 'postcss-loader',
              options: postcssOptions
            }
          ]
        },
        // The loader for scss or sass.
        {
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
            },
            {
              loader: 'css-loader',
              options: {
                esModule: true,
                importLoaders: 2,
                modules: cssModulesOptions
              }
            },
            {
              loader: 'postcss-loader',
              options: postcssOptions
            },
            {
              loader: 'sass-loader'
            }
          ]
        },
        // The loader for assets.
        {
          type: 'asset/resource',
          test: /\.(mp3|ogg|wav|mp4|flv|webm)$/i
        },
        {
          test: /\.svg$/i,
          oneOf: [
            {
              issuer: /\.[jt]sx?$/i,
              type: 'asset/resource',
              resourceQuery: /^\?url$/,
              use: [
                {
                  loader: '@nuintun/svgo-loader'
                }
              ]
            },
            {
              issuer: /\.[jt]sx?$/i,
              use: [
                {
                  loader: 'swc-loader',
                  options: swcOptions
                },
                {
                  loader: 'svgc-loader'
                }
              ]
            },
            {
              type: 'asset/resource',
              use: [
                {
                  loader: '@nuintun/svgo-loader'
                }
              ]
            }
          ]
        },
        {
          type: 'asset/resource',
          test: /\.(png|gif|bmp|ico|jpe?g|webp|woff2?|ttf|eot)$/i
        }
      ]
    }
  ];
};
