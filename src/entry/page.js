import App from '../views/app_page/index.vue'
import buiweex from 'bui-weex'

Vue.use(buiweex);

Vue.component('meta-operation',require("../components/meta_operation/operation.vue"));
//demo
Vue.component('meta-widget-w1',require("../widgets/demo/page/w1.vue"));
Vue.component('meta-widget-w2',require("../widgets/demo/page/w2.vue"));
Vue.component('meta-widget-opt1',require("../widgets/demo/operation/opt1.vue"));
Vue.component('meta-widget-opt2',require("../widgets/demo/operation/opt2.vue"));

App.el = '#root'

new Vue(App)
