<template lang="html">
    <div v-if="showComponent" class="form-group form-hrb">
        <div class="label-wrapper">
            <text class="form-label">{{definition.componentParams.title}}</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <switch @change="change" :disabled="readonly" :value="value"></switch>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'Boolean',
    extends: mixin,
    methods: {
        change(e) {
            this.$emit('input', e.value);
        }
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>