<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <text class="form-input" :style="inputStyle" @click="inputClicked">{{valueText || '选择用户...'}}</text>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
const linkapi = require("linkapi");

export default {
    componentType: 'SingleUserSelect',
    extends: mixin,
    data() {
        return {
            valueText: '',
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
        inputClicked(e) {
            linkapi.startContactSingleSelector(this.definition.componentParams.title, 1, {}, (result) => {
                this.$emit('input', result.id)
                this.valueText = result.name;
            }, (err) => {
                this.$alert(err);
            })
        }
    },
}
</script>

<style src="../styles/common.css"></style>
