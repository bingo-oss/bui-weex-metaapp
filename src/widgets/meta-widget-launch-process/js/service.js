import ax from '../../../js/ajax.js';
import config from '../../../js/config';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');

const service={
    startProcessInstanceCmd(param){
        //启动流程
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.post(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/process-instances`, param).then(function(res){
                    resolve(res);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            });
        });
    },
    getProcdefSetting(processDefinitionKey){
        //根据流程定义，及环节名获取合并后的流程配置
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.metabase.endpoint"]}/proc_tool/proc/setting/${processDefinitionKey}`)
                .then(function ({data}) {
                    resolve(data);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            });
        });
    },
    getfirstSteps(procDefKey){
        //没有发起流程时获取下一步信息
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/process-definitions/${procDefKey}/first_steps`)
                    .then(function ({data}) {
                        resolve(data);
                    },(err)=>{
                        reject(err);
                    });
            },(err)=>{
                reject(err);
            });
        });
    }
};
export default service;