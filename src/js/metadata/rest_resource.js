import ajax from '../ajax';
import _ from '../tool/lodash';
var template = require('url-template');
function resource(restResourceUrl,customActions,options){
    let root=options&&options.root;
    if(root&&(!_.startsWith(restResourceUrl,'http'))){
        restResourceUrl=`${root}/${restResourceUrl}`;
    }
    var defaultActions={
        get(id){
            let url=template.parse(restResourceUrl).expand({id:id});
            return ajax.get(url).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        },
        query(queryParam){
            let url=template.parse(restResourceUrl).expand({id:null});
            return ajax.get(url,queryParam).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        },
        save(data,queryParam){
            let url=template.parse(restResourceUrl).expand({id:null});
            let param = {};
            param.method = 'POST';
            param.body = data;
            param.queryParam = queryParam;
            return ajax.request(param).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        },
        update(id,data){
            let url=template.parse(restResourceUrl).expand({id:id});
            return ajax.patch(url,data).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        },
        delete(id){
            let url=template.parse(restResourceUrl).expand({id:id});
            return ajax.delete(url).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{
                return Promise.reject(e);
            });
        },
        calc(data){
            let url=template.parse(`${restResourceUrl}/calc`).expand({id:null});
            return ajax.post(url).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        },
        ui(){
            let url=template.parse(`${restResourceUrl}/_ui.json`).expand({id:null});
            return ajax.get(url).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        },
        relationUI(params){///
            let url=template.parse(`${restResourceUrl}/$relations{/relation}/_ui.json`).expand({id:null,relation:params&&params.relation});
            return ajax.get(url).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        }
    }
    //一对多关系查询
    _.forIn(customActions,(value,name)=>{
        let method=value.method,url=value.url;
        if(root&&(!_.startsWith(url,'http'))){
            url=`${root}/${restResourceUrl}`;
        }
        defaultActions[name]=function(params){
            let url=template.parse(`${restResourceUrl}/$relations{/relation}/_ui.json`).expand({id:null,parentEntityId:params&&params.parentEntityId});
            return ajax.get(url).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        }
    });
    return defaultActions;
}
export default resource;