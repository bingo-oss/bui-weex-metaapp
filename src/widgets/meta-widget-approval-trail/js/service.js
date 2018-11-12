import ax from '../../../js/ajax.js';
import config from '../../../js/config';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');

const service= {
    tasksInfo(id){
        return new Promise(function (resolve, reject) {
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(`${runtimeConfig["service.activiti.runtime.endpoint"]}/v1/process-instances/${id}/tasksInfo`, {}).then(res=> {
                    resolve(res.data);
                });
            })
        });
    }
}


export default service