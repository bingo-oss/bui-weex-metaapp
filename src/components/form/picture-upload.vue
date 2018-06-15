<template lang="html">
    <div v-if="showComponent" class="form-group">
        <div class="label-wrapper">
            <text class="form-label">{{definition.componentParams.title}}</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <text class="form-input" :style="inputStyle" @click="inputClicked">{{valueText || '选择图片...'}}</text>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
const linkapi = require("linkapi");

export default {
    componentType: 'PictureUpload',
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
            if(this.readonly){
                return;
            }
            linkapi.selectFiles(1, (result) => {
                // this.$alert(result);
                if (result.resource) {
                    linkapi.uploadFiles(result.resource, (res) => {
                        this.$alert(res);
                    }, (err) => {
                        this.$alert(err);
                    })
                } else {
                    // No resource selected.
                }
                // this.$emit('input', result.id)
                // this.valueText = result.name;
            }, (err) => {
                this.$alert(err);
            })
        }
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>