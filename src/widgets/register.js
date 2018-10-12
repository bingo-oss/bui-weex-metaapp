import ajax from '../js/ajax.js';
//import buiweex from 'bui-weex';
let getContextPath = function () {
    let url = weex.config.bundleUrl;
    if(url.indexOf('?')>0){
        url = url.substring(0,url.indexOf('?'));
    }
    url = url.split('/').slice(0, -1).join('/');
    return url;
};
let getWidget = function(tagName){
    //没有发起流程时获取下一步信息
    return new Promise(function(resolve,reject){
        //console.log(`${getContextPath()}/${tagName}.weex.js`);
        let queryParam = {
            url:`${getContextPath()}/${tagName}.weex.js`,
            method:'GET',
            body: {},
            type:"text"
        };
        ajax.request(queryParam).then(({data})=>{
            console.log(data);
            resolve(data);
        },(err)=>{
            reject(err);
        });
    });
}

export default function(Vue) {
    Vue.component('meta-widget-w1', require("./demo/page/w1.vue"));
    Vue.component('meta-widget-w2', require("./demo/page/w2.vue"));
    Vue.component('meta-widget-opt1', require("./demo/operation/opt1.vue"));
    Vue.component('meta-widget-opt2', require("./demo/operation/opt2.vue"));
    //列表,表单部件
    Vue.component('meta-widget-view', require("./meta-widget-view.vue"));
    Vue.component('meta-widget-form', require("./meta-widget-form.vue"));
    //页面部件
    Vue.component('meta-widget-page', require("./meta-widget-page.vue"));
    Vue.component('meta-widget-launch-process', require("./meta-widget-launch-process/meta-widget-launch-process.vue"));
    Vue.component('meta-widget-todo-list', require("./meta-widget-todo-list/meta-widget-todo-list.vue"));
    Vue.component('meta-widget-approval-process', require("./meta-widget-approval-process/meta-widget-approval-process.vue"));
    //提交审批框组件
    Vue.component('submission-frame', require("./meta-widget-approval-process/components/submission-frame/submission-frame.vue"));
    //附件组件
    Vue.component('attachment', require("./meta-widget-approval-process/components/attachment/attachment.vue"));
    //独立开发部件 通用性较差
    //oa-列表部件
    /*Vue.component('meta-widget-oa-list', resolve => require(['./meta-widget-oa-list/meta-widget-oa-list.vue'], resolve));*/
    Vue.component('meta-widget-oa-list', require("./meta-widget-oa-list/meta-widget-oa-list.vue"));
    //oa-详情部件
    Vue.component('meta-widget-oa-details', require("./meta-widget-oa-details/meta-widget-oa-details.vue"));
    //oa-处理部件
    Vue.component('meta-widget-oa-operation', require("./meta-widget-oa-operation/meta-widget-oa-operation.vue"));
    Vue.component('meta-widget-navbar', {});

    //动态部件
    Vue.component('meta-widget-dynamic', require("./meta-widget-dynamic/meta-widget-dynamic.vue"));
    //成员部件
    Vue.component('meta-widget-member', require("./meta-widget-member/meta-widget-member.vue"));
    //相关部件
    Vue.component('meta-widget-relative', require("./meta-widget-relative/meta-widget-relative.vue"));
    //轨迹部件
    Vue.component('meta-widget-approval-trail', require("./meta-widget-approval-trail/meta-widget-approval-trail.vue"));
    //主页部件
    Vue.component('meta-widget-home', require("./meta-widget-home/meta-widget-home.vue"));
    //webview部件
    Vue.component('meta-widget-webview', require("./meta-widget-webview/meta-widget-webview.vue"));


}