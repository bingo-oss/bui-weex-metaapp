import ax from '../ajax.js';
import config from '../config.js';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');

const pageService={
    get(pageId){
        return new Promise(function(resolve,reject) {
            config.readRuntimeConfig().then(runtimeConfig => {
                ax.get(runtimeConfig["service.metad.api.endpoint"]+`/mp_page/${pageId}`).then(({data})=>{
                    resolve(data.layout);
                },()=>{
                    var testPath=`${buiweex.getContextPath()}/test_page/${pageId}.json`;
                    linkapi.readTextFromFile(testPath, 'utf-8', data => {
                        resolve(data);
                    },()=>{
                        reject();
                    });
                });
            });
        })
    }
};
export default pageService;