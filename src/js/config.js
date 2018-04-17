const linkapi = require('linkapi');
var modal = weex.requireModule('modal')

/**
 * 在开发调试时，可以将 debug 设为 true，并设置相应的 token，viewId 和 formId 来调试
 * 发布时记得将 debug 设为 false
 *
 */

export default {
    debug: true,
    // debug: false,
    debugConfigUrl: 'https://developer.bingosoft.net:12100/services/tool/system/config',

    debugViewId: 'ybKtnxaBKbBTL5NNf2tbZW', // 警力报备
    // debugViewId: 'BxuEmvqNSHahVM5gudEC2H', // 大事记
    // debugViewId: 'n34Zs9i2qAeEeqnZvfwUnW', // 行动列表
    // debugViewId: 'JJUzCgvZQzgxBuytyKmz8e', // test

    // debugFormId: 'Q7BjDyu92EkGenAL6zcfhb', // 大事记
    debugFormId: 'ssyreSd', // 行动

    debugEntityId: 'O1PRfnK1A',

    token: 'bf456764-43da-4eae-a5b2-240791d1f201',
    configFilename: 'config.json',

    // 读取与 list.weex.js、form.weex.js 同级的配置文件
    readRuntimeConfig(contextPath) {
        return new Promise((resolve, reject) => {
            contextPath = contextPath.replace('file://', ''); // 消除 file:
            let absPath = `${contextPath}/${this.configFilename}`;
            linkapi.readTextFromFile(absPath, 'utf-8', str => {
                try {
                    let config = JSON.parse(str)
                    resolve(config);
                } catch(err) {
                    reject(err);
                }
            }, err => {
                reject(err);
            })
        })

    }
}
