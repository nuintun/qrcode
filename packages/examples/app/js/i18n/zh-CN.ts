/**
 * @module i18n/zh-CN
 *
 * Chinese dictionary. The source of truth for dictionary shape: en-US.ts is
 * typed as `typeof zhCN` so a missing or extra key fails type checking.
 */

const zhCN = {
  app: {
    title: '二维码'
  },
  common: {
    confirm: '确定',
    unknownError: '发生未知错误',
    on: '开',
    off: '关'
  },
  tabs: {
    encode: '二维码编码',
    decode: '二维码解码'
  },
  encode: {
    mode: '编码模式',
    charset: '字符编码',
    version: '版本大小',
    level: '纠错等级',
    fnc1: '支持 FNC1',
    fnc1None: '否',
    aimIndicator: 'AIM 标识',
    moduleSize: '模块大小',
    quietZone: '静区大小',
    quietZoneTip: '推荐 4 倍模块大小',
    autoCalculate: '自动计算',
    foreground: '前景颜色',
    background: '背景颜色',
    submit: '编码'
  },
  decode: {
    result: '解码结果【{n}】',
    locateTitle: '解码结果【{n}】定位',
    detailsTitle: '解码结果【{n}】详情',
    overview: '概览',
    locate: '定位',
    details: '详情',
    selectImage: '选择图片',
    strict: '严格模式',
    strictTip: '可增加扫描速度，但会降低识别率',
    invert: '图片反色',
    submit: '解码'
  },
  worker: {
    notFound: '未发现二维码',
    locateFailed: '生成位置定位图失败'
  },
  clipboard: {
    copy: '复制',
    copied: '复制成功',
    failed: '复制失败'
  },
  error: {
    title: '页面错误',
    retry: '重试页面',
    description: '抱歉，发生错误，无法渲染页面，请联系系统管理员或者重试页面！'
  },
  imagePicker: {
    invalidType: '请选择图片格式文件',
    readFailed: '读取文件失败'
  }
};

export default zhCN;
