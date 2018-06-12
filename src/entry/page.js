import App from '../views/app_page/index.vue'
import buiweex from 'bui-weex'

Vue.use(buiweex);

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

App.el = '#root'

new Vue(App)
