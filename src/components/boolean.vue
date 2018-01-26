<template lang="html">
    <div class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <switch @change="change" :value="value"></switch>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'Boolean',
    extends: mixin,
    data() {
        return {
        }
    },
    methods: {
        change(e) {
            this.$emit('input', e.value);
        }
    },
}
</script>

<style src="../styles/common.css"></style>
