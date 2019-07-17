const linkapi = require('linkapi');
const storage = weex.requireModule('storage');
import i18n from '../js/i18n/index';
import buiweex from 'bui-weex';
import ajax from '../js/ajax.js';
import metaservice from "../js/metadata/metaservice"
import metabase from "../js/metadata/metabase"
//const configServerUrl = "https://link.bingocc.cc:5443/services"
//const configServerUrl = "https://saaslinkdev.projects.bingosoft.net:22283/services";
/**
 * 在开发调试时，可以将 debug 设为 true，并设置相应的 token，viewId 和 formId 来调试
 * 发布时记得将 debug 设为 false
 *
 */
var configData = null;
export default {
    debug: false,
    token: 'bG9jYWw6NmJhNTMzYTQtMzQ4MS00NmJkLWEwNDktNjkwMDA4NWUyN2U2',
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
                this.getProjectId().then((projectId)=>{
                    //读取全局配置地址方式
                    metaservice.getProject(projectId).then((projectInfo)=>{
                        ajax.get(`${projectInfo.engine.externalUrl}/web.json`).then((resp) => {
                        //ajax.get(`http://10.200.84.125:9596/api/web.json`).then((resp) => {
                            configData=Object.assign(resp.data,{
                                "apiBaseUrl":projectInfo.engine.externalUrl/*"http://10.200.84.125:9596/api"*/,
                                "configServerUrl":`${projectInfo.engine.externalUrl}/web.json`/*"http://10.200.84.125:9596/api/web.json"*/,
                                "blogApi": resp.data["service.blog.endpoint"],
                                "uamUrl": resp.data["service.link.endpoint"],
                                "engineService": resp.data["service.gateway.endpoint"]+"/services",
                                "ufsUrl":projectInfo.engine.externalUrl.replace("api","")+resp.data["service.ufs.endpoint"]
                            });
                            this.serverConfig = configData;
                            resolve(configData);
                        },()=>{
                            this.serverConfig = {};
                            resolve({})
                        });
                    },(e)=>{});
                })
                //end
            }
        })

    },
    getMetaServiceUrl(contextPath) {
        return new Promise((resolve, reject) => {
            //resolve(configServerUrl+"/metaservice")
            contextPath = contextPath || buiweex.getContextPath();
            contextPath = contextPath.replace('file://', ''); // 消除 file:
            let absPath = `${contextPath}/${this.configFilename}`;
            linkapi.readTextFromFile(absPath, 'utf-8', data => {
                try {
                    if (data.configServerUrl) {
                        //获取服务端的配置
                        resolve(data.configServerUrl+"/metaservice")
                    }
                } catch (err) {
                    reject(err);
                }
            }, err => {
                reject(err);
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
    },
    getProjectId(){
        //获取项目id
        return new Promise((resolve, reject) => {
            let pageParam = buiweex.getPageParams();
            storage.getItem("pageProjectId",({data})=> {
                //先读取缓存上的,若没有怎读取页面上的,以页面参数优先
                let projectId = data;
                if (pageParam && pageParam.projectId) {
                    //页面上带上了项目id
                    projectId = pageParam.projectId
                    storage.setItem("pageProjectId", pageParam.projectId)
                }
                resolve(projectId)
            });
        });
    },
    getMetabase(){
        //获取实体对象
        return new Promise((resolve, reject) => {
            this.getProjectId().then(projectId=>{
                metabase.initMetabase(projectId).then(ddd=>{
                    resolve(metabase);
                })
            });
        });
    }
}
