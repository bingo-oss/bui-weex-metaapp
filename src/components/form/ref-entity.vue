<template lang="html">
    <div v-if="showComponent" class="form-group">
        <div class="label-wrapper">
            <text class="form-label">{{definition.componentParams.title}}</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <div class="from-input-wrapper" @click="inputClicked">
            <text class="form-input" :style="inputStyle">{{valueText || '请选择'}}</text>
            <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
        </div>

        <bui-popup v-model="showPopup" pos="right" width=600>
            <popup-view
                :definition="definition"
                :entityResourceUrl="entityResourceUrl"
                @itemSelected="itemSelected"
                @cancel="showPopup = false">
            </popup-view>
        </bui-popup>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import ajax from '../../js/ajax.js'

export default {
    componentType: 'RefEntity',
    extends: mixin,
    props: {
        entityResourceUrl: String,
    },
    data() {
        return {
            valueText: '',
            showPopup: false,
        }
    },
    computed: {
        inputStyle() {
            return {
                color: this.value ? 'black' : '#BEBCBC'
            }
        },
    },
    watch: {
        value: {
            immediate: true,
            handler(v) {
                if (!this.filterMode && v) {
                    this.fetchDisplayNameForId(v);
                }
            }
        },
        filterValue: {
            immediate: true,
            handler(val) {
                if (this.filterMode) {
                    let ret = /eq\s(\S*)$/.exec(val);
                    if (ret) {
                        this.fetchDisplayNameForId(ret[1])
                    }
                }
            }
        }
    },
    methods: {
        fetchDisplayNameForId(id) {
            if (!this.entityResourceUrl) {
                console.log('missing entityResourceUrl');
                return;
            }
            ajax.get(`${this.entityResourceUrl}/${id}`).then(resp => {
                this.valueText = resp.data.title;
            });
        },
        inputClicked() {
            if(this.readonly){
                return;
            }
            this.showPopup = true;
        },
        itemSelected(item) {
            if (this.filterMode) {
                let v = `${this.definition.dataField} eq ${item.id}`;
                this.$emit('filterInput', v);
            } else {
                this.$emit('input', item.id);
            }
            this.showPopup = false;
        }
    },
    components: {
        'popup-view': require('./ref-entity-popup.vue'),
    },
}
</script>
<style src="../../styles/common.css" scoped="false"></style>
