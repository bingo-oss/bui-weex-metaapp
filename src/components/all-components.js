import _ from '../js/tool/lodash';
const formComponents= {
    'SingleLineText': require('./form/single-line-text.vue'),
    'MultiLineText': require('./form/multi-line-text.vue'),
    'NumberInput': require('./form/number-input.vue'),
    'Boolean': require('./form/boolean.vue'),
    'RadioButton': require('./form/radio-button.vue'),
    'CheckboxGroup': require('./form/checkbox-group.vue'),
    'Description': require('./form/description.vue'),
    'DivisionLine': require('./form/division-line.vue'),
    'Date': require('./form/date.vue'),
    'Time': require('./form/time.vue'),
    'SingleSelect': require('./form/single-select.vue'),
    'CascadeSelect': require('./form/cascade-select.vue'),
    'SingleUserSelect': require('./form/single-user-select.vue'),
    'MultiUserSelect': require('./form/multi-user-select.vue'),
    'SingleOrgSelect': require('./form/single-org-select.vue'),
    'MultiOrgSelect': require('./form/multi-org-select.vue'),
    'PictureUpload': require('./form/picture-upload.vue'),
    'RefEntity': require('./form/ref-entity.vue'),
    'DateTime': require('./form/datetime.vue'),
}
const tools={
    'refresh-wrapper': require('./common/refresh.vue'),
    'loading-wrapper': require('./common/loading.vue')
}
function install(Vue, opts = {}){
    _.each(formComponents,function(v,k){
        Vue.component(`Meta${k}`,v);
    });
    _.each(tools,function(v,k){
        Vue.component(k,v);
    });
}
export default {
    install
}
