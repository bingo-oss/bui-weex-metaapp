import businessList from '../views/business/businessList.vue'
import buiweex from 'bui-weex'

Vue.use(buiweex);

businessList.el = '#root'

new Vue(businessList)