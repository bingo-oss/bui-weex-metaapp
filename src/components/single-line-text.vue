<template lang="html">
    <div class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <input @input="input" class="form-input" type="text" :value="value" :placeholder="definition.componentParams.placeholder"/>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'SingleLineText',
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
            return false;
        }
    }
}
</script>

<style src="../styles/common.css"></style>
