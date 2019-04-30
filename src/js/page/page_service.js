import ax from '../ajax.js';
import config from '../config.js';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');
var isIPhone = (weex.config.env.deviceModel.indexOf("iPhone") != -1)
var isAndroid = (weex.config.env.deviceModel.indexOf("iPhone") == -1)
const pageService = {
    get(pageId, byOperation) {
        if (!byOperation) byOperation = false;
        return new Promise(function (resolve, reject) {
            config.readRuntimeConfig().then(runtimeConfig => {
                let mobileType = "";
                if (isIPhone) {
                    mobileType = 2
                } else if (isAndroid) {
                    mobileType = 1
                }
                ax.get(runtimeConfig["apiBaseUrl"] + `/$pages/${pageId}`)
                    .then(({data}) => {
                        resolve(data);
                    }, (error) => {
                        ax.get(`${buiweex.getContextPath()}/test_page/${pageId}.json`)
                            .then(({data}) => {
                                resolve(data);
                            }, () => {
                                reject();
                            });
                    });
            }, (erro) => {
                reject(erro);
            });
        })
    }
};
export default pageService;
