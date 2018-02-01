<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <textarea @input="input" class="form-input" :value="value" :placeholder="definition.componentParams.placeholder" rows="3"/>
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
