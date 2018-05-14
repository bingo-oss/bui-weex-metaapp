import ajax from '../ajax';
var template = require('url-template');
function resource(restResourceUrl){
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
            debugger
            let url=template.parse(restResourceUrl).expand({id:id});
            return ajax.delete(url).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        },
        calc(data){
            let url=template.parse(`${restResourceUrl}/calc`).expand({id:null});
            return ajax.post(url).then((resp) => {
                return Promise.resolve(resp.data);
            },e=>{return Promise.reject(resp);});
        }
    }
    return defaultActions;
}
export default resource;