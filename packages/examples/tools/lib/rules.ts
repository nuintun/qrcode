/**
 * @module rules
 * @description Rspack 模块规则配置模块，定义不同文件类型的加载器处理规则
 */

import rspack from '@rspack/core';
import swcrc from '../../.swcrc.ts';
import svgorc from '../../.svgorc.ts';
import type { GetProp } from '../index.ts';
import lightningcssrc from '../../.lightningcssrc.ts';
import type { Configuration, Mode } from '@rspack/core';

/**
 * @typedef Rules
 * @description Rspack 模块规则类型，从 Configuration 中提取的 rules 属性类型
 */
type Rules = GetProp<GetProp<Configuration, 'module'>, 'rules'>;

/**
 * @function resolveRules
 * @description 根据打包模式生成 Rspack 的模块处理规则配置
 * @param mode 打包模式，'development' 或 'production'，影响 sourceMap 和类名生成策略
 */
export default async function (mode: Mode): Promise<Rules> {
  const swcOptions = await swcrc(mode);
  const isDevelopment = mode !== 'production';
  const lightningcssOptions = await lightningcssrc(mode);
  const svgoOptions = { ...(await svgorc(mode)), configFile: false };

  /**
   * @function getCssLoaderOptions
   * @description 生成 CSS Loader 的配置选项
   * @param importLoaders 设置在 css-loader 之前应用的 loader 数量
   */
  const getCssLoaderOptions = (importLoaders: number) => {
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
              loader: 'css-modules-types-loader/rspack'
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
              loader: 'css-modules-types-loader/rspack'
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
                  loader: '@nuintun/svgo-loader/rspack',
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
                  loader: 'svgc-loader/rspack',
                  options: svgoOptions
                }
              ]
            },
            {
              type: 'asset/resource',
              use: [
                {
                  loader: '@nuintun/svgo-loader/rspack',
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
}
