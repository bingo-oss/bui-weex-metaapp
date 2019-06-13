const linkapi = require('linkapi');
import i18n from '../js/i18n/index';
import buiweex from 'bui-weex';
import ajax from '../js/ajax.js';
const configServerUrl =
    //"https://appfactoryservice.bingolink.biz/services/tool/system/config";
    "https://developer.bingosoft.net:12100/services/tool/system/config";
    /*"http://20.97.71.73/services/tool/system/config";*/
/**
 * 在开发调试时，可以将 debug 设为 true，并设置相应的 token，viewId 和 formId 来调试
 * 发布时记得将 debug 设为 false
 *
 */
var configData = null;
export default {
    debug: true,
    token: 'c2Fhc3NzbzoxYWNhYTc2OS04YzY2LTQwY2MtYjc4ZC1kOWYyMjg0YzMwZTY',
    configFilename: 'config.json',
    serverConfig: {},
    // 读取与 list.weex.js、form.weex.js 同级的配置文件
    readRuntimeConfig(contextPath) {
        contextPath = contextPath || buiweex.getContextPath();
        return new Promise((resolve, reject) => {
            if (configData) {
                this.serverConfig = configData;
                resolve(configData);
            } else {
/*                configData=Object.assign({},{
                    "configServerUrl":configServerUrl,
                    "blogApi": "",
                    "uamUrl": "",
                    "engineService": ""
                });
                this.serverConfig = {};
                resolve(configData);*/

                //读取全局配置地址方式
            ajax.get(configServerUrl).then((resp) => {
                configData=Object.assign(resp.data,{
                    "configServerUrl":configServerUrl,
                    "blogApi": resp.data["service.blog.endpoint"],
                    "uamUrl": resp.data["service.link.endpoint"],
                    "engineService": resp.data["service.gateway.endpoint"]+"/services",
                    //全局替换规则
                    "replaceRules":{}
                });
                this.serverConfig = configData;
                resolve(configData);
            },()=>{
                this.serverConfig = {};
                resolve({})
            });
                //end

                 /*//读取文件config.json 配置方式
                 contextPath = contextPath.replace('file://', ''); // 消除 file:
                let absPath = `${contextPath}/${this.configFilename}`;
                linkapi.readTextFromFile(absPath, 'utf-8', data => {
                    try {
                        if (data.configServerUrl) {
                            //获取服务端的配置
                            ajax.get(data.configServerUrl).then((resp) => {
                                configData = Object.assign(data, resp.data, {
                                    "blogApi": resp.data["service.blog.endpoint"],
                                    "uamUrl": resp.data["service.link.endpoint"],
                                    "engineService": resp.data["service.gateway.endpoint"] + "/services"
                                });
                                this.serverConfig = configData;
                                resolve(configData);
                            }, (err) => {
                                reject(err);
                            })
                        } else {
                            configData = data;
                            resolve(configData);
                        }
                    } catch (err) {
                        reject(err);
                    }
                }, err => {
                    reject(err);
                })
                 //end*/
            }
        })

    },
    getMetaServiceUrl() {
        return new Promise((resolve, reject) => {
            this.readRuntimeConfig().then((c) => {
                var url = c['service.metabase.endpoint'];
                if (url) {
                    resolve(url);
                } else {
                    buiweex.toast(i18n.noMetadataConfigUrl);
                    reject();
                }
            });
        });
    },
    getApiBaseUrl() {
        return new Promise((resolve, reject) => {
            this.readRuntimeConfig().then((c) => {
                var url = c['apiBaseUrl'];
                if (url) {
                    resolve(url);
                } else {
                    buiweex.toast(i18n.noMetadataConfigUrl);
                    reject();
                }
            });
        });
    },
    getStreamUrl() {
        return new Promise((resolve, reject) => {
            this.readRuntimeConfig().then((c) => {
                var url = c['service.stream.endpoint'];
                if (url) {
                    resolve(url);
                } else {
                    buiweex.toast(i18n.noMetadataConfigUrl);
                    reject();
                }
            });
        });
    }
}
