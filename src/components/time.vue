<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <text class="form-input" :style="inputStyle" @click="inputClicked">{{value || '选择时间...'}}</text>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
const picker = weex.requireModule('picker');

export default {
    componentType: 'Time',
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
            picker.pickTime({
                value: 'HH:mm'
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
