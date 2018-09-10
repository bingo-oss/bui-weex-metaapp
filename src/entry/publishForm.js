import publishForm from '../views/components/publishForm.vue'
import buiweex from 'bui-weex'
import mixins from '../js/mixins.js'

Vue.mixin(mixins);
Vue.use(buiweex);

publishForm.el = '#root'

new Vue(publishForm)