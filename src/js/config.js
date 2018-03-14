const linkapi = require('linkapi');
var modal = weex.requireModule('modal')


export default {
    // debug: true,
    debug: false,
    debugConfigUrl: 'https://developer.bingosoft.net:12100/services/tool/system/config',
    debugViewId: 'n34Zs9i2qAeEeqnZvfwUnW',
    debugFormId: 'ssyreSd',
    token: '7acbcce8-ba55-4c44-8c50-f9362649ee1b',
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
