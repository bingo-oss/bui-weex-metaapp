import ax from '../../../js/ajax.js';
import config from '../../../js/config';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');

const service={
    getMetaEntityProcRelation(metaEntityId){
        //获取某实体关联的流程
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                let params = {};
                params.filters = `metaEntityId eq ${metaEntityId}`
                ax.get(`${runtimeConfig["service.metaservice.endpoint"]}/meta_entity_proc_relation`,params).then(res=>{
                    resolve(res);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            })
        });
    },
    getfirstSteps(procDefKey,projectId){
        //没有发起流程时获取下一步信息
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                // ax.get(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/process-definitions/${procDefKey}/first_steps`)
                ax.get(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/process-definitions/${projectId}/${procDefKey}/first_steps`)
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
                //ax.post(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/process-instances`, param).then(function(res){
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
                // ax.post(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/tasks/${param.taskId}/complete`, param).then(res=>{
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
    getTaskInfo(businessKey){
        //获取任务详情
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                // ax.get(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/tasks/info`,{businessKey:businessKey}).then(res=>{
                ax.get(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/tasks/info`,{businessKey:businessKey}).then(res=>{
                    resolve(res.data);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            })
        });
        /*return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/tasks/info`,{taskId:taskId,businessKey:businessKey,getInstance: true}).then(res=>{
                    debugger
                    resolve(res.data);
                },(err)=>{
                    console.log('gogo===>',err);
                    reject(err);
                });
            },(err)=>{
                reject(err);
            })
        });*/
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
    isApproval(taskId){
        //当前用户是否可以审核该任务
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/tasks/${taskId}/permission/approval`)
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
