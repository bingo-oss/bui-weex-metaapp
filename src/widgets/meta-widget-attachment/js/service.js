import ax from '../../../js/ajax.js';
import config from '../../../js/config';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');

const service={
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