import ax from '../ajax.js';
import config from '../config.js';
import buiweex from 'bui-weex';

const pageService={
    get(pageId){
        return new Promise(function(resolve,reject) {
            /*ax.get(`http://10.200.84.125:3333/project/bui-weex-metaapp/dist/test_page/${pageId}.json`).then(({data})=>{
                 resolve(data);
             },()=>{
                 reject();
             });*/
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(runtimeConfig["service.metad.api.endpoint"]+`/mp_page/${pageId}`).then(({data})=>{
                    if(typeof data.layout=="string"){
                        data.layout = eval('('+data.layout+')');
                    }
                    resolve(data.layout);
                },()=>{
                    reject();
                });
            });
        })
    }
};
export default pageService;