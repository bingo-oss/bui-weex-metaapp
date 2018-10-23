import ax from '../ajax.js';
import config from '../config.js';
import buiweex from 'bui-weex';
const linkapi = require('linkapi');
var isIPhone =  (weex.config.env.deviceModel.indexOf("iPhone")!=-1)
var isAndroid =  (weex.config.env.deviceModel.indexOf("iPhone")==-1)
const pageService={
    get(pageId,byOperation){
        if(!byOperation)byOperation=false;
        return new Promise(function(resolve,reject) {
            config.readRuntimeConfig().then(runtimeConfig => {
                /*var testPath=`https://saaslinkdev.projects.bingosoft.net:22283/web/test_page/${pageId}.json`;
                ax.get(testPath).then((data) => {
                    resolve(data.data);
                });*/
                let mobileType = "";
                if(isIPhone){
                    mobileType = 2
                }else if(isAndroid){
                    mobileType = 1
                }
                ax.get(runtimeConfig["service.metabase.endpoint"]+`/mp_page/${pageId}?terminalType=${mobileType}&byOperation=${byOperation}`).then(({data})=>{
                    resolve(data);
                },()=>{
                    ax.get(`http://10.200.84.125:3333/project/bui-weex-metaapp/dist/test_page/${pageId}.json`).then(({data})=>{
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