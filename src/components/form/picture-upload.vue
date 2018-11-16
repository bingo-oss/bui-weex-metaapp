<template lang="html">
    <div v-if="showComponent" class="">
        <template v-if="viewMode||forceView">
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                    <text class="view-text" :value="valueText"></text>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group form-hrb">
                <div class="label-wrapper">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
                <text class="form-input" :style="inputStyle" @click="inputClicked">{{valueText || '选择图片...'}}</text>
            </div>
        </template>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
const linkapi = require("linkapi");
const fileTransfer = weex.requireModule('FileTransferModule');
const FileModule = weex.requireModule('FileModule');

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
                /*if (result.resource) {
                    linkapi.uploadFiles(result.resource, (res) => {
                        this.$alert(res);
                    }, (err) => {
                        //this.$alert(err);
                    })
                } else {
                    // No resource selected.
                }*/
                this.$alert(result)
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