import App from '../views/list.vue'
import buiweex from 'bui-weex'
import allComponents from '../components/all-components'

Vue.use(buiweex);
Vue.use(allComponents);

App.el = '#root'

new Vue(App)
