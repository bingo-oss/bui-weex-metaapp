<template lang="html">
    <div v-if="showComponent" class="form-group-vertical">
        <div class="label-wrapper-vertical">
            <text class="form-label">{{definition.componentParams.title}}:</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <textarea @input="input" class="form-input-textarea" :value="value" :placeholder="definition.componentParams.placeholder" rows="3"/>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import SingleLineText from './single-line-text.vue'

export default {
    componentType: 'MultiLineText',
    extends: SingleLineText,
}
</script>

<style src="../styles/common.css"></style>
<style scoped="">
.form-input-textarea {
    flex: 1;
    font-size: 36px;
}
</style>
