import App from '../views/list.vue'
import buiweex from 'bui-weex'
import allComponents from '../components/all-components'
import mixins from '../js/mixins.js'

Vue.mixin(mixins);
Vue.use(buiweex);
Vue.use(allComponents);

App.el = '#root'

new Vue(App)
