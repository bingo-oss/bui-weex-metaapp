import config from '../../../js/config';
var $resource;
config.readRuntimeConfig().then(runtimeConfig => {
    $resource=Vue.resource('v1/tasks/todo',null,null,{root:runtimeConfig["service.activiti.runtime.endpoint"]});
});
export default {
    $resource: $resource
};