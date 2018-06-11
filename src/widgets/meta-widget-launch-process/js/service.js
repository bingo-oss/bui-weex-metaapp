import ax from '../../../js/ajax.js';
import config from '../../../js/config';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');

const service={
    startProcessInstanceCmd(param){
        //启动流程
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.post(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/process-instances`, JSON.stringify(param), function (res) {
                    resolve(res);
                });
            });
        });
    },
    getProcdefSetting(processDefinitionKey){
        //根据流程定义，及环节名获取合并后的流程配置
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.metabase.endpoint"]}/mp_procdef_setting/proc/def/${processDefinitionKey}`, {}, function (res) {
                    resolve(res);
                });
            });
        });
    }
};
export default service;