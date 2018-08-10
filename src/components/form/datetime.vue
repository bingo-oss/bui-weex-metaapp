<template lang="html">
    <div v-if="showComponent" class="form-group">
        <template v-if="viewMode||forceView">
            <div class="label-wrapper">
                <text class="form-label view-label">{{definition.componentParams.title}}</text>
                <text class="view-text" :value="filterPointStartText+''"></text>
            </div>
        </template>
        <template v-else>
            <div class="label-wrapper">
                <text class="form-label">{{definition.componentParams.title}}</text>
                <text class="required-mark" v-if="definition.componentParams.required">*</text>
            </div>
            <div v-if="filterMode">
                <div>
                    <div class="from-input-wrapper date-border-picker" @click="pickStart">
                        <text class="form-input" :style="inputStyle">{{filterPointStartText || '请选择'}}</text>
                        <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
                    </div>
                    <div class="from-input-wrapper date-border-picker" @click="pickEnd">
                        <text class="form-input" :style="inputStyle">{{filterPointEndText || '请选择'}}</text>
                        <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
                    </div>
                </div>
            </div>
            <div v-if="!filterMode" class="from-input-wrapper" @click="inputClicked">
                <text class="form-input" :style="inputStyle">{{valueText || '请选择'}}</text>
                <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
            </div>
        </template>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
//const picker = weex.requireModule('PickerModule');
const picker = weex.requireModule('picker');
import utils from '../../js/tool/utils';

export default {
    componentType: 'DateTime',
    extends: mixin,
    data() {
        return {
            filterPointStart: '',
            filterPointEnd: '',
            datetimeFormat:'yyyy-MM-dd HH:mm'
        }
    },
    computed: {
        inputStyle() {
            return {
                color: this.valueText ? 'black' : '#BEBCBC'
            }
        },
        filterPointStartText() {
            if (this.filterPointStart) {
                let d = this.parseDate(this.filterPointStart);
                return utils.formatDate(d,this.datetimeFormat);
            }
            return '';
        },
        filterPointEndText() {
            if (this.filterPointEnd) {
                let d = this.parseDate(this.filterPointEnd);
                return utils.formatDate(d,this.datetimeFormat);
            }
            return '';
        },
        valueText() {
            if (this.value) {
                let d = new Date(this.value);
                return utils.formatDate(d,this.datetimeFormat);
            }
            return '';
        }
    },
    watch: {
        filterValue: {
            immediate: true,
            handler(val) {
                if (this.filterMode) {
                    // begin ge '2018-03-09 00:00:06' and begin le '2018-04-15 04:00:00'
                    let ret1 = /ge\s'([^']*)'/.exec(val);
                    let ret2 = /le\s'([^']*)'/.exec(val);
                    if (ret1) {
                        this.filterPointStart = ret1[1];
                    }
                    if (ret2) {
                        this.filterPointEnd = ret2[1];
                    }
                }
            }
        }
    },
    methods: {
        pickDateTime() {
            return new Promise((resolve, reject) => {
                picker.pickDate({
                    format: this.datetimeFormat,
                }, (res) => {
                    if (res.result === 'success') {
                        resolve(`${res.data}:00`);
                    }
                })
            })
        },
        inputClicked() {
            if(this.readonly){
                return;
            }
            this.pickDateTime().then(dateStr => {
                let date = this.parseDate(dateStr);
                this.$emit('input', date.toISOString());
            })
        },
        parseDate(str) {
            // 参考 ISO Date String
            str = str.replace(' ', 'T');
            let isoStr = `${str}+08:00`;
            // this.$alert(isoStr)
            return new Date(isoStr)
        },
        toFilterPresentation(start, end) {
            if (start) {
                start = `${this.definition.dataField} ge '${start}'`;
            }
            if (end) {
                end = `${this.definition.dataField} le '${end}'`;
            }
            if (start && end) {
                return `${start} and ${end}`;
            } else {
                return start || end;
            }
        },
        pickStart() {
            if(this.readonly){
                return;
            }
            this.pickDateTime().then(start => {
                this.$emit('filterInput', this.toFilterPresentation(start, this.filterPointEnd));
            })
        },
        pickEnd() {
            if(this.readonly){
                return;
            }
            this.pickDateTime().then(end => {
                this.$emit('filterInput', this.toFilterPresentation(this.filterPointStart, end));
            })
        }
    },
}
</script>
<style src="../../styles/common.css" scoped="false"></style>
<style>
.date-border-picker {
    padding-top: 10px;
}
</style>
