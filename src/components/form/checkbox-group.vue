<template lang="html">
    <div v-if="showComponent" class="form-group-vertical">
        <div class="label-wrapper-vertical">
            <text class="form-label">{{definition.componentParams.title}}:</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <bui-checkbox :items="items" @input="input" :value="value"></bui-checkbox>
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
    computed: {
        items() {
            return this.definition.componentParams.options.map(o => {
                return {
                    value: o.id,
                    title: o.text
                }
            })
        }
    },
    methods: {
        input(value) {
            this.$emit('input', value);
        }
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>