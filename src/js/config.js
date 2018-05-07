const linkapi = require('linkapi');
import i18n from '../js/i18n/zh';
import buiweex from 'bui-weex';
import ajax from '../js/ajax.js';

/**
 * 在开发调试时，可以将 debug 设为 true，并设置相应的 token，viewId 和 formId 来调试
 * 发布时记得将 debug 设为 false
 *
 */
var configData=null;
export default {
    debug: true,
    // debug: false,

    //debugViewId: 'ybKtnxaBKbBTL5NNf2tbZW', // 警力报备
    // debugViewId: 'BxuEmvqNSHahVM5gudEC2H', // 大事记
    //debugViewId: 'n34Zs9i2qAeEeqnZvfwUnW', // 行动列表
    // debugViewId: 'JJUzCgvZQzgxBuytyKmz8e', // test

    // debugFormId: 'Q7BjDyu92EkGenAL6zcfhb', // 大事记
    //debugFormId: 'ssyreSd', // 行动

    //debugEntityId: 'O1PRfnK1A',

    token: '86e083c3-0a8a-457d-819b-8fae197a76c8',
    configFilename: 'config.json',

    // 读取与 list.weex.js、form.weex.js 同级的配置文件
    readRuntimeConfig(contextPath) {
        contextPath=contextPath||buiweex.getContextPath();
        return new Promise((resolve, reject) => {
            if(configData){
                resolve(configData);
            }else{
                contextPath = contextPath.replace('file://', ''); // 消除 file:
                let absPath = `${contextPath}/${this.configFilename}`;
                linkapi.readTextFromFile(absPath, 'utf-8', data => {
                    try {
                        if(data.configServerUrl){
                            //获取服务端的配置
                            ajax.get(data.configServerUrl).then((resp) => {
                                configData=Object.assign(data,resp.data);
                                resolve(configData);
                            })
                        }else{
                            configData=data;
                            resolve(configData);
                        }
                    } catch(err) {
                        reject(err);
                    }
                }, err => {
                    reject(err);
                })
            }
        })

    },
    getMetaServiceUrl(){
        return new Promise((resolve, reject) => {
            this.readRuntimeConfig().then((c)=>{
                var url=c['service.metabase.endpoint'];
                if(url){
                    resolve(url);
                }else{
                    buiweex.toast(i18n.noMetadataConfigUrl);
                    reject();
                }
            });
        });
    },
    getApiBaseUrl(){
        return new Promise((resolve, reject) => {
            this.readRuntimeConfig().then((c)=>{
                debugger
                var url=c['apiBaseUrl'];
                if(url){
                    resolve(url);
                }else{
                    buiweex.toast(i18n.noMetadataConfigUrl);
                    reject();
                }
            });
        });
    }
}
