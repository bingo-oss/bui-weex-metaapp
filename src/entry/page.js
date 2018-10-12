import App from '../views/app_page/index.vue'
import buiweex from 'bui-weex'
import mixins from '../js/mixins.js'
/*import register from "../widgets/register"*/
Vue.mixin(mixins);
Vue.use(buiweex);
/*register(Vue);*/

Vue.component('meta-operation',require("../components/meta_operation/operation.vue"));
Vue.component('meta-opt-btn',require("../components/meta_operation/btn/opt_btn.vue"));
//demo
Vue.component('meta-widget-w1',require("../widgets/demo/page/w1.vue"));
Vue.component('meta-widget-w2',require("../widgets/demo/page/w2.vue"));
Vue.component('meta-widget-opt1',require("../widgets/demo/operation/opt1.vue"));
Vue.component('meta-widget-opt2',require("../widgets/demo/operation/opt2.vue"));
//列表,表单部件
Vue.component('meta-widget-view',require("../widgets/meta-widget-view.vue"));
Vue.component('meta-widget-form',require("../widgets/meta-widget-form.vue"));
Vue.component('meta-widget-page',require("../widgets/meta-widget-page.vue"));
Vue.component('meta-widget-launch-process',require("../widgets/meta-widget-launch-process/meta-widget-launch-process.vue"));
Vue.component('meta-widget-todo-list',require("../widgets/meta-widget-todo-list/meta-widget-todo-list.vue"));
Vue.component('meta-widget-approval-process',require("../widgets/meta-widget-approval-process/meta-widget-approval-process.vue"));
//提交审批框组件
Vue.component('submission-frame',require("../widgets/meta-widget-approval-process/components/submission-frame/submission-frame.vue"));
//附件组件
Vue.component('attachment',require("../widgets/meta-widget-approval-process/components/attachment/attachment.vue"));

//独立开发部件 通用性较差
//oa-列表部件
Vue.component('meta-widget-oa-list',require("../widgets/meta-widget-oa-list/meta-widget-oa-list.vue"));
//oa-详情部件
Vue.component('meta-widget-oa-details',require("../widgets/meta-widget-oa-details/meta-widget-oa-details.vue"));
//oa-处理部件
Vue.component('meta-widget-oa-operation',require("../widgets/meta-widget-oa-operation/meta-widget-oa-operation.vue"));
//导航部件
Vue.component('meta-widget-navbar', {});
//动态部件
Vue.component('meta-widget-dynamic', require("../widgets/meta-widget-dynamic/meta-widget-dynamic.vue"));
//成员部件
Vue.component('meta-widget-member', require("../widgets/meta-widget-member/meta-widget-member.vue"));
//相关部件
Vue.component('meta-widget-relative', require("../widgets/meta-widget-relative/meta-widget-relative.vue"));
//轨迹部件
Vue.component('meta-widget-approval-trail', require("../widgets/meta-widget-approval-trail/meta-widget-approval-trail.vue"));
//主页部件
Vue.component('meta-widget-home', require("../widgets/meta-widget-home/meta-widget-home.vue"));
//webview部件
Vue.component('meta-widget-webview', require("../widgets/meta-widget-webview/meta-widget-webview.vue"));



App.el = '#root'

new Vue(App)
