/**
 * 获取元数据相关信息的接口，包括表单、视图、套件和项目等基本信息获取接口
 * swagger json定义：https://developer.bingosoft.net:12100/services/metaservice/swagger.json
 */
import ajax from '../ajax';
import config from '../config';

var customActions = {
    getFormByShortId(id){
        return new Promise((resolve, reject) => {
            config.getMetaServiceUrl().then(urlBase=>{
                ajax.get(`${urlBase}/meta_form/short/${id}`).then(({data})=>{resolve(data);},e=>{reject(e);})
            })
        });
    },
    getProject(id){
        return new Promise((resolve, reject) => {
            config.getMetaServiceUrl().then(urlBase=>{
                ajax.get(`${urlBase}/meta_project/${id}`).then(({data})=>{resolve(data);},e=>{reject(e);})
            })
        });
    },
    getViewByShortId(id){
        return new Promise((resolve, reject) => {
            config.getMetaServiceUrl().then(urlBase=>{
                ajax.get(`${urlBase}/meta_view/short/${id}`).then(({data})=>{resolve(data);},e=>{reject(e);})
            })
        });
    }
};

export default customActions;
