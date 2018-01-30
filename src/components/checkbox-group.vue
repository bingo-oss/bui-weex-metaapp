<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
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

<style src="../styles/common.css"></style>
