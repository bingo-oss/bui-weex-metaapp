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
                <text class="form-input" :style="inputStyle">{{valueText || '请选择'}}</text>
                <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
            </div>
        </template>
    </div>
</template>

<script>
const linkapi = require("linkapi");
import SingleUserSelect from './single-user-select.vue'
export default {
    componentType: 'MultiUserSelect',
    extends: SingleUserSelect,
    watch: {
        value: {
            immediate: true,
            handler(v) {
                if (!this.filterMode&&v) {
                    linkapi.getUserInfo(v, (result) => {
                        this.valueText = result.map(u => u.userName).join(',');
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
                        linkapi.getUserInfo(ret[1], (result) => {
                            this.valueText = result.userName;
                        })
                    }
                }
            }
        }
    },
    methods: {
        inputClicked(e) {
            if(this.readonly){
                return;
            }
            linkapi.startContactMulitSelector(this.definition.componentParams.title, 1, {}, (result) => {
                this.valueText = result.user.map(u => u.name).join(',');
                this.$emit('input', result.user.map(u => u.userId));
                //this.$alert(result);
                if(this.valueText){
                    let text = this.valueText
                    this.emitExData(result.user.map(u => u.userId),text);
                }
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
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>