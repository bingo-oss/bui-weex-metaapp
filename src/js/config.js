const linkapi = require('linkapi');
import i18n from '../js/i18n/index';
import buiweex from 'bui-weex';
import ajax from '../js/ajax.js';
/*
const configServerUrl = "https://developer.bingosoft.net:12100/services/tool/system/config";
*/

/**
 * 在开发调试时，可以将 debug 设为 true，并设置相应的 token，viewId 和 formId 来调试
 * 发布时记得将 debug 设为 false
 *
 */
var configData=null;
export default {
    debug: false,
    token: 'c2Fhc3NzbzoyMGZiNDE5MS1kM2Y4LTRkMDYtYjE1Yy04MTdmNmI0YjU4Njg',
    configFilename: 'config.json',
    serverConfig:{},
    // 读取与 list.weex.js、form.weex.js 同级的配置文件
    readRuntimeConfig(contextPath) {
        contextPath=contextPath||buiweex.getContextPath();
        return new Promise((resolve, reject) => {
            if(configData){
                this.serverConfig = configData;
                resolve(configData);
            }else{
                /*configData=Object.assign({},{
                    "configServerUrl":configServerUrl,
                    "blogApi": "",
                    "uamUrl": "",
                    "engineService": ""
                });
                this.serverConfig = {};
                resolve(configData);*/
/*                ajax.get(configServerUrl).then((resp) => {
                    configData=Object.assign(resp.data,{
                        "configServerUrl":configServerUrl,
                        "blogApi": resp.data["service.blog.endpoint"],
                        "uamUrl": resp.data["service.link.endpoint"],
                        "engineService": resp.data["service.gateway.endpoint"]+"/services"
                    });
                    this.serverConfig = configData;
                    resolve(configData);
                },()=>{
                    this.serverConfig = {};
                    resolve({})
                });*/
                contextPath = contextPath.replace('file://', ''); // 消除 file:
                let absPath = `${contextPath}/${this.configFilename}`;
                 linkapi.readTextFromFile(absPath, 'utf-8', data => {
                    try {
                        if(data.configServerUrl){
                            //获取服务端的配置
                            ajax.get(data.configServerUrl).then((resp) => {
                                configData=Object.assign(data,resp.data,{
                                    "blogApi": resp.data["service.blog.endpoint"],
                                    "uamUrl": resp.data["service.link.endpoint"],
                                    "engineService": resp.data["service.gateway.endpoint"]+"/services"
                                });
                                this.serverConfig = configData;
                                resolve(configData);
                            },(err)=>{
                                reject(err);
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
                var url=c['apiBaseUrl'];
                if(url){
                    resolve(url);
                }else{
                    buiweex.toast(i18n.noMetadataConfigUrl);
                    reject();
                }
            });
        });
    },
    getStreamUrl(){
        return new Promise((resolve, reject) => {
            this.readRuntimeConfig().then((c)=>{
                var url=c['service.stream.endpoint'];
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
