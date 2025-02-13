/**
 * @module rules
 * @description 配置 Rspack 规则
 */

import rspack from '@rspack/core';
import swcrc from '../../.swcrc.js';
import svgorc from '../../.svgorc.js';
import lightningcssrc from '../../.lightningcssrc.js';

/**
 * @function resolveRules
 * @param {string} mode
 * @return {Promise<NonNullable<import('@rspack/core').Configuration['module']>['rules']>}
 */
export default async mode => {
  const swcOptions = await swcrc(mode);
  const isDevelopment = mode !== 'production';
  const lightningcssOptions = await lightningcssrc(mode);
  const svgoOptions = { ...(await svgorc(mode)), configFile: false };

  /**
   * @function getCssLoaderOptions
   * @param {number} importLoaders
   * @return {object}
   */
  const getCssLoaderOptions = importLoaders => {
    return {
      importLoaders,
      esModule: true,
      sourceMap: isDevelopment,
      modules: {
        auto: true,
        exportLocalsConvention: 'camel-case-only',
        localIdentName: isDevelopment ? '[local]-[hash:8]' : '[hash:8]'
      }
    };
  };

  return [
    {
      oneOf: [
        // The loader for js.
        {
          test: /\.[jt]sx?$/i,
          exclude: /[\\/]node_modules[\\/]/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: swcOptions
            }
          ]
        },
        // The loader for css.
        {
          test: /\.css$/i,
          use: [
            {
              loader: rspack.CssExtractRspackPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
            },
            {
              loader: 'css-loader',
              options: getCssLoaderOptions(1)
            },
            {
              loader: 'builtin:lightningcss-loader',
              options: lightningcssOptions
            }
          ]
        },
        // The loader for scss or sass.
        {
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: rspack.CssExtractRspackPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
            },
            {
              loader: 'css-loader',
              options: getCssLoaderOptions(2)
            },
            {
              loader: 'builtin:lightningcss-loader',
              options: lightningcssOptions
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment
              }
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
                  loader: '@nuintun/svgo-loader',
                  options: svgoOptions
                }
              ]
            },
            {
              issuer: /\.[jt]sx?$/i,
              use: [
                {
                  loader: 'builtin:swc-loader',
                  options: swcOptions
                },
                {
                  loader: 'svgc-loader',
                  options: svgoOptions
                }
              ]
            },
            {
              type: 'asset/resource',
              use: [
                {
                  loader: '@nuintun/svgo-loader',
                  options: svgoOptions
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
