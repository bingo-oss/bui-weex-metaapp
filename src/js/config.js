const linkapi = require('linkapi');
var modal = weex.requireModule('modal')


export default {
    // debug: true,
    debug: false,
    debugConfigUrl: 'https://developer.bingosoft.net:12100/services/tool/system/config',
    // debugViewId: 'ybKtnxaBKbBTL5NNf2tbZW', // 警力报备
    // debugViewId: 'BxuEmvqNSHahVM5gudEC2H', // 大事记
    // debugViewId: 'n34Zs9i2qAeEeqnZvfwUnW', // 行动列表
    debugViewId: 'JJUzCgvZQzgxBuytyKmz8e', // test
    debugFormId: 'Q7BjDyu92EkGenAL6zcfhb', // 大事记
    // debugFormId: 'ssyreSd',
    debugEntityId: 'O1PRfnK1A',
    token: 'de73ccab-23c7-4a8f-9378-43c7b6bb544b',
    configFilename: 'config.json',

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
