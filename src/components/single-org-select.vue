<template lang="html">
    <div v-if="showComponent" class="form-group">
        <div class="label-wrapper">
            <text class="form-label">{{definition.componentParams.title}}:</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <div class="from-input-wrapper" @click="inputClicked">
            <text class="form-input" :style="inputStyle">{{valueText || '请选择'}}</text>
            <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
        </div>
    </div>
</template>

<script>
const linkapi = require("linkapi");
import mixin from './component-mixin.js'

export default {
    componentType: 'SingleOrgSelect',
    extends: mixin,
    data() {
        return {
            valueText: '',
        }
    },
    computed: {
        inputStyle() {
            return {
                color: this.value ? 'black' : '#BEBCBC'
            }
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(v) {
                linkapi.getDeptInfoById(v, (result) => {
                    this.valueText = result.name;
                }, err => {
                    console.log(err)
                })
            }
        },
        filterValue: {
            immediate: true,
            handler(val) {
                if (this.filterMode) {
                    let ret = /eq\s(\S*)/.exec(val);
                    if (ret) this.value = ret[1];
                }
            }
        }
    },
    methods: {
        inputClicked(e) {
            linkapi.startContactSingleSelector(this.definition.componentParams.title, 4, {}, (result) => {
                if (this.filterMode) {
                    this.$emit('filterInput', `${this.definition.dataField} eq ${result.orgId}`);
                } else {
                    this.$emit('input', result.orgId);
                }
            }, (err) => {
                this.$alert(err);
            })
        }
    },
}
</script>

<style src="../styles/common.css"></style>
