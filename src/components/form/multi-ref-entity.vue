<template lang="html">
    <div v-if="showComponent" class="" :style="{'background-color':(validatorErrorBag?'#FAA':'')}">
        <template v-if="viewMode||forceView">
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                    <text class="view-text" v-for="item in selectItems">{{item.title}}</text>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group form-hrb">
                <div class="label-wrapper">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
                <div class="from-input-wrapper" style="align-items: center;" @click="inputClicked">
                    <div style="flex: 1; justify-content: flex-end; align-items: flex-end;">
                        <text class="form-input _label" v-for="item in selectItems" :style="inputStyle">{{item.title}}</text>
                    </div>
                    <text class="form-input" v-if="selectItems.length==0" :style="inputStyle">{{'请选择'}}</text>
                    <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
                </div>

                <bui-popup v-model="showPopup" pos="right" width=750>
                    <popup-view
                            :definition="definition"
                            :refEntitys="definition.componentParams.refEntitys"
                            :selected-item="value"
                            @itemSelected="itemSelected"
                            @cancel="showPopup = false">
                    </popup-view>
                </bui-popup>
            </div>
        </template>
    </div>
</template>

<script>
    import mixin from './component-mixin.js'
    import ajax from '../../js/ajax.js'
    import _ from '../../js/tool/lodash';
    import metabase from '../../js/metadata/metabase.js';
    import service from '../../js/service.js';
    import config from '../../js/config.js';

    export default {
        componentType: 'MultiRefEntity',
        extends: mixin,
        props: {
            entityResourceUrl: String,
        },
        data() {
            service.init(config.serverConfig.configServerUrl); //初始化请求地址
            _.each(this.definition.componentParams.refEntitys,(refEntity)=>{
                if(refEntity.entityId){
                    service.getMetaEntity(refEntity.entityId).then(res => {
                        //e.title = res.title;
                        refEntity.entityResourceUrl = `${res.project.engine.externalUrl}/${metabase.lowerUnderscore(res.name)}`;
                    });
                }
            });//获取实体引擎地址
            return {
                valueText: '',
                selectItems:[],//已选数据
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
                        this.selectItems = new Array(v.length);//声明长度
                        _.each(v,(e,index)=>{
                            this.fetchDisplayNameForId(e,index);//获取数据
                        })
                        /*this.fetchDisplayNameForId(v);*/
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
            fetchDisplayNameForId(id,index) {
                _.each(this.definition.componentParams.refEntitys,(refEntity)=>{
                    if (!refEntity.entityResourceUrl) {
                        console.log('missing entityResourceUrl');
                        return;
                    }
                    ajax.get(`${refEntity.entityResourceUrl}/${id}`).then(resp => {
                        this.selectItems[index] = {
                            title:resp.data[refEntity.titleField],
                            id:id,
                            entityId:refEntity.entityId
                        };
                        //this.valueText = resp.data[refEntity.titleField]||resp.data.title;
                        this.emitExData(this.selectItems);
                        this.$forceUpdate();
                    },function(erro){
                        this.selectItems[index] = {
                            title:id,
                            id:id,
                            entityId:refEntity.entityId
                        };
                    });
                });
            },
            inputClicked() {
                if(this.readonly){
                    return;
                }
                this.showPopup = true;
            },
            itemSelected(items) {
                if (this.filterMode) {
                    //let v = `${this.definition.dataField} eq ${item.id}`;
                    //this.$emit('filterInput', v);
                } else {
                    this.$emit('input', items);
                }
                this.showPopup = false;
            },
            emitExData:function(items){
                if(!items[0].name)return
                var exData={};
                _.each(items,(item)=>{
                    exData[item.id]=item;
                });
                let _dataField = this.definition.dataField;
                this.$emit("exDataChanged",exData,_dataField);
            }
        },
        components: {
            'popup-view': require('./multi-ref-entity-popup.vue'),
        },
    }
</script>
<style src="../../styles/common.css" scoped="false"></style>
