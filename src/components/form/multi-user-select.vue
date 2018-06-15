<template lang="html">
    <div v-if="showComponent" class="form-group">
        <div class="label-wrapper">
            <text class="form-label">{{definition.componentParams.title}}</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <div class="from-input-wrapper" @click="inputClicked">
            <text class="form-input" :style="inputStyle">{{valueText || '请选择'}}</text>
            <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
        </div>
    </div>
</template>

<script>
const linkapi = require("linkapi");
import SingleUserSelect from './single-user-select.vue'

export default {
    componentType: 'MultiUserSelect',
    extends: SingleUserSelect,
    methods: {
        inputClicked(e) {
            if(this.readonly){
                return;
            }
            linkapi.startContactMulitSelector(this.definition.componentParams.title, 1, {}, (result) => {
                this.valueText = result.user.map(u => u.name).join(',');
                this.$emit('input', result.user);
                // this.$alert(result);
            }, (err) => {
                this.$alert(err);
            })
        }
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>