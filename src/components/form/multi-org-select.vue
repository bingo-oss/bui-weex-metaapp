<template lang="html">
    <div v-if="showComponent" class="form-group">
        <template v-if="viewMode||forceView">
            <div class="label-wrapper">
                <text class="form-label view-label">{{definition.componentParams.title}}</text>
                <text class="view-text" :value="valueText"></text>
            </div>
        </template>
        <template v-else>
            <div class="label-wrapper">
                <text class="form-label">{{definition.componentParams.title}}</text>
                <text class="required-mark" v-if="definition.componentParams.required">*</text>
            </div>
            <div class="from-input-wrapper" @click="inputClicked">
                <text class="form-input" :style="inputStyle" :value="valueText"></text>
                <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
            </div>
        </template>
    </div>
</template>

<script>
const linkapi = require("linkapi");
import SingleUserSelect from './single-user-select.vue'
import _ from '../../js/tool/lodash';
import buiweex from "bui-weex";

export default {
    componentType: 'MultiOrgSelect',
    extends: SingleUserSelect,
    data() {
        return {
            orgNameArry:[],
            valueText:"请选择"
        }
    },
    computed: {
        inputStyle() {
            return {
                color: this.orgNameArry.length ? '' : '#BEBCBC'
            }
        }
    },
    watch:{
        value: {
            immediate: true,
            handler(v) {
                this.orgNameArry = []
                if (!this.filterMode&&v) {
                    _.each(v,(e,index)=>{
                        linkapi.getDeptInfoById(e, (result) => {
                            this.orgNameArry.push(result.name)
                        }, err => {
                            console.log(err)
                        })
                    })
                }
            }
        },
        filterValue: {
            immediate: true,
            handler(val) {
                if (this.filterMode) {
                    let ret = /eq\s(\S*)$/.exec(val);
                    if (ret) {
                        linkapi.getDeptInfoById(ret[1], (result) => {
                            this.valueText = result.name;
                        }, err => {
                            console.log(err);
                        })
                    }
                }
            }
        },
        orgNameArry(newData){
            if(newData.length) {
                this.valueText = newData.join(",");
            }else{
                this.valueText = "请选择"
            }
        }
    },
    methods: {
        inputClicked(e) {
            if(this.readonly){
                return;
            }
            linkapi.startContactMulitSelector(this.definition.componentParams.title, 4, {}, (result) => {
                 this.valueText = result.organization.map(u => u.name).join(",");
                 this.$emit('input', result.organization.map(u => u.orgId));
                if(this.valueText){
                    let _text  = this.valueText
                    this.emitExData(result.organization.map(u => u.orgId),_text);
                }
                //this.$alert(result);
            }, (err) => {
                this.$alert(err);
            })
        },
        emitExData:function(id,text){
            var exData={};
            exData[id]=this.buildExData(text);
            let _dataField = this.definition.dataField;
            this.$emit("exDataChanged",exData,_dataField);
        }
    }
}
</script>

<style src="../../styles/common.css" scoped="false"></style>