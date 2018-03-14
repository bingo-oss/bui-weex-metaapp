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

        <bui-popup v-model="showPopup" pos="right" width=600>
            <popup-view :definition="definition" @itemSelected="itemSelected" @cancel="showPopup = false"></popup-view>
        </bui-popup>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import ajax from '../js/ajax.js'
const picker = weex.requireModule('picker');

export default {
    componentType: 'RefEntity',
    extends: mixin,
    data() {
        return {
            valueText: '',
            entities: [],
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
        value(v) {
            if (v) {
                ajax.get(`${this.definition.componentParams.entityResourceUrl}/${v}`).then(resp => {
                    this.valueText = resp.data.title;
                });
            }
        }
    },
    methods: {
        inputClicked() {
            this.showPopup = true;
        },
        itemSelected(item) {
            this.$emit('input', item.id);
            this.showPopup = false;
        }
    },
    created() {
        ajax.get(this.definition.componentParams.entityResourceUrl).then(resp => {
            this.entities = resp.data;
        });
    },
    components: {
        'popup-view': require('./ref-entity-popup.vue'),
    },
}
</script>

<style src="../styles/common.css"></style>
