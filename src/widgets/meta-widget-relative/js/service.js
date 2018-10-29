import ax from '../../../js/ajax.js';
import config from '../../../js/config';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');

const service={
    getHomePage(id){
        //获取主页配置
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.metabase.endpoint"]}/mp_subset/query/${id}`, {}).then(res=>{
                    resolve(res.data);
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