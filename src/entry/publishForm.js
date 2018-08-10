import publishForm from '../views/components/publishForm.vue'
import buiweex from 'bui-weex'

Vue.use(buiweex);

publishForm.el = '#root'

new Vue(publishForm)