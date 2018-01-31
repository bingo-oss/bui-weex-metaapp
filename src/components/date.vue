<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <text class="form-input" :style="inputStyle" @click="inputClicked">{{value || '选择日期...'}}</text>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
const picker = weex.requireModule('picker');

export default {
    componentType: 'Date',
    extends: mixin,
    data() {
        return {
        }
    },
    computed: {
        inputStyle() {
            return {
                color: this.value ? '' : '#BEBCBC'
            }
        }
    },
    methods: {
        inputClicked() {
            picker.pickDate({
                value: 'yyyy-MM-dd'
            }, (res) => {
                if (res.result === 'success') {
                    this.$emit('input', res.data);
                }
            })
        }
    },
}
</script>

<style src="../styles/common.css"></style>
