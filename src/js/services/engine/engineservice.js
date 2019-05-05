/**
 * 扩展---获取运行时的一些参数相关信息的接口
 *
*/

import ax from '../../../js/ajax.js';
import config from '../../../js/config';
import buiweex from 'bui-weex';
import metabase from '../../../js/metadata/metabase';
const linkapi = require('linkapi');

const service={
    getEntity(entityName){
        //通过实体名称获取实体信息
        return new Promise(function(resolve,reject){
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig.apiBaseUrl}/entities/${entityName}`)
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
