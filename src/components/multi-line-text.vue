<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <textarea @input="input" class="form-input" :value="value" :placeholder="definition.componentParams.placeholder" rows="3"/>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import EventBus from '../js/bus.js'

export default {
    componentType: 'MultiLineText',
    extends: mixin,
    data() {
        return {
        }
    },
    methods: {
        input(e) {
            this.$emit('input', e.value);
        },

        validate() {
            if (!this.definition.componentParams.validation.validate) {
                // Validation off
                return true;
            }
            // Validation fail return false
            return true;
        }
    },
}
</script>

<style src="../styles/common.css"></style>
