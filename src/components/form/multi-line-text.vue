<template lang="html">
    <div v-if="showComponent" class="" :style="{'background-color':(validatorErrorBag?'#FAA':'')}">
        <template v-if="viewMode||forceView">
            <div class="form-group-vertical">
                <div class="label-wrapper-vertical">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                    <text class="form-input-textarea" :value="value"></text>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group-vertical form-hrb">
                <div class="label-wrapper-vertical">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
                <textarea ref="textarea" @input="input" :disabled="readonly" class="form-input-textarea" :value="value" :placeholder="definition.componentParams.placeholder" rows="3"/>
            </div>
        </template>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import SingleLineText from './single-line-text.vue'

export default {
    componentType: 'MultiLineText',
    extends: SingleLineText,
    watch:{
        validatorErrorBag(val){
            if(val){
                this.$refs['textarea'].focus();
            }
        }
    }
}
</script>
<style src="../../styles/common.css" scoped="false"></style>
<style scoped="">
.form-input-textarea {
    flex: 1;
    font-size: 36px;
    height: 200px;
}
</style>
