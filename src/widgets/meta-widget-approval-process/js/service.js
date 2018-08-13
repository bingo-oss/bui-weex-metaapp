import ax from '../../../js/ajax.js';
import config from '../../../js/config';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');

const service={
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
    },
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
    taskComplete(param){
        //完成任务
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.post(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/tasks/${param.taskId}/complete`, param).then(res=>{
                    resolve(res.data);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            })
        });
    },
    getTaskInfo(taskId,businessKey){
        //获取任务详情
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/tasks/info`,{taskId:taskId,businessKey:businessKey,getInstance: true}).then(res=>{
                    resolve(res.data);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            })
        });
    },
    getProcdefSetting(processDefinitionKey,actId){
        //根据流程定义，及环节名获取合并后的流程配置
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.metabase.endpoint"]}/proc_tool/proc/setting/${processDefinitionKey}`, {actId: actId}).then((res)=>{
                    resolve(res.data);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            })
        });
    },
    taskReject(param){
        //驳回任务
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.post(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/tasks/${param.taskId}/reject`, param).then(res=>{
                    resolve(res);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            })
        });
    },
    getAttachment(taskId,businessKey){
        //获取附件
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.metad.api.endpoint"]}/mp_attachment`, {filters: `taskId eq ${taskId} or businessKey eq ${businessKey}`, orderby: "displayOrder asc"}).then(res=>{
                    resolve(res);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            })
        });
    }
};
export default service;