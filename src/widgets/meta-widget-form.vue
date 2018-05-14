<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>
<style src="../styles/common.css" scoped="false"></style>
<template>
    <div class="container">
        <bui-header :leftItem="{icon: 'ion-chevron-left'}" :title="data.title" @leftClick="() =>{this.$pop()}"></bui-header>
        <scroller class="scroller" :style="{height:(getDeviceHeight-250)+'px'}">
            <div class="scrollerDiv" v-for="o in data.layout" v-if="['SingleUserSelect','MultiUserSelect','SingleOrgSelect'].indexOf(o.componentType)==-1">
                <component :is="'Meta'+o.componentType"
                           :ref = "o.id"
                           :definition = "o"
                           :value =  "result[o.dataField]"
                           :wholeDefinition =  "data"
                           :entityResourceUrl =  "o.componentParams.entityResourceUrl"
                           @input="o.input"
                ></component>
            </div>
        </scroller>
        <div class="action-bar" v-if="widgetParams.editOperations||widgetParams.viewOperations">
            <template v-for="(commonOpt,index) in [].concat(widgetParams.viewOperations,widgetParams.editOperations)">
                <meta-operation style="flex:1" :operation="commonOpt" :widget-context="getWidgetContext">
                    <text class="action-button">{{commonOpt.title}}</text>
                </meta-operation>
            </template>
        </div>
    </div>
</template>
<style lang="css">
    .container {
        flex-direction: column;
        align-items: stretch;
    }

    .scroller {
        /*padding-left: 20px;
        padding-right: 20px;*/
        flex: 1;
    }
    .scrollerDiv{
        padding-left: 20px;
        padding-right: 20px;
    }
    .action-bar {
        height: 100px;
        flex-direction: row;
        align-items: center;
        background-color: #F9F9F9;
    }

    .action-button {
        flex: 1;
        font-size: 34px;
        text-align: center;
        color: #86868D;
        border-left-color: #BEBCBC;
        border-left-width: 1px;
        border-left-style: solid;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 20px;
        padding-bottom: 20px;
    }
    .widget-operation{
        background-color: #000;
    }

</style>

<script>
    import ajax from '../js/ajax.js'
    import service from '../js/service.js'
    import config from '../js/config.js';
    import perm from '../js/perm.js';
    import buiweex from 'bui-weex';
    import allComponents from '../components/all-components';
    import metabase from '../js/metadata/metabase.js';

    Vue.use(allComponents);
    Vue.use(buiweex);

    const globalEvent = weex.requireModule('globalEvent');
    // const data = require('../demoData.json')

    module.exports = {
        props:{
            widgetParams:{
                type:Object,
                required:true
            }
        },
        methods: {
            fetchCalcDefaultValues() {
                return ajax.post(`${this.engineUrl}/${this.entityName}/calc`, this.requestDefaultValueParam).then(resp => {
                    this.defaultValues = resp.data;
                }).catch(err => {
                    this.$alert('获取默认值失败')
                    this.$alert(err)
                })
            },
            input(v){
                this.$refs.forEach((o) =>{});
                //return (v)=>{ _t.$alert(v);_t.$set(_t.result,dataField, v)}
                //this.$alert(dataField);
                //this.$set(this.result, o.dataField, v);
            },
            doSaveModel(){
                //通用保存操作后的回调方法,内置的保存逻辑
            }
        },
        data () {
            return {
                result: {},
                existedRecord: {},
                permObj: {},
                // data: data,
                data: {},
                queryParam: {},
                readOnly: false,
                engineUrl: '',
                entityId: '',
                entityName: '',
                isPostingData: false,
                requestDefaultValueParam: null,
                defaultValues: {},
                innerPermissions:{
                    openEdit:true,//开启编辑按钮权限
                    edit:true,//修改或者保存按钮权限
                    del:true,//删除按钮权限
                    cancel:true//取消按钮
                },
                metaEntity:{}
            }
        },
        computed: {
            getWidgetContext(){
                //传入操作的上下文内容
                return {
                    "form": this,
                    "metaEntity": this.metaEntity,
                    "selectedId": this.result.id,
                    "selectedItem": this.result
                }
            },
            getDeviceHeight(){
                return (750/(weex.config.env.deviceWidth))*weex.config.env.deviceHeight
            }
        },
        watch: {
            defaultValues(val) {
                // 将默认值 merge 到当前 result 里
                for (let k in val) {
                    if (this.result[k] === undefined) {
                        this.$set(this.result, k, val[k]);
                    }
                }
            },
            "permObj"(val){
                let _t = this;
                Object.assign(_t.innerPermissions,{"openEdit":!val.canRead,"cancel":val.canCreate,"edit":val.canEdit,"del":val.canDelete})
            },
            "existedRecord"(val){
                let forms = [];
                // 遍历 layout 里的所有表单项
                this.data.layout && this.data.layout.forEach((o) => {
                    if (this.entityId) {
                        // 当前表单正在编辑实体
                        if (this.existedRecord[o.dataField] !== undefined
                                && this.result[o.dataField] === undefined /*避免重复设值，造成 render 死循环*/) {
                            // 将已有记录里的值填充进 result 里
                            this.$set(this.result, o.dataField, this.existedRecord[o.dataField]);
                        }
                    }
                    switch (o.componentType) {
                        case "RadioButton": {
                            // 读取默认值
                            if (this.result[o.dataField] === undefined) {
                                o.componentParams.options.forEach(option => {
                                    if (option.checked) {
                                        this.$set(this.result, o.dataField, option.id);
                                        return;
                                    }
                                });
                            } else {
                                // 已有默认值，将其强制转为字符串
                                if (typeof this.result[o.dataField] === 'number') {
                                    this.result[o.dataField] += '';
                                }
                            }
                            break;
                        }
                        case 'CheckboxGroup': {
                            // 读取默认值
                            if (!this.result[o.dataField]) {
                                let tmp = [];
                                o.componentParams.options.forEach(option => {
                                    if (option.checked) {
                                        tmp.push(option.id);
                                    }
                                })
                                this.$set(this.result, o.dataField, tmp);
                            }
                            break;
                        }
                        case "SingleSelect": {
                            // 读取默认值
                            if (!this.result[o.dataField]) o.componentParams.options.forEach(option => {
                                if (option.checked) {
                                    this.$set(this.result, o.dataField, option.id);
                                    return;
                                }
                            });
                            break;
                        }

                        default: {
                            break;
                        }
                    }
                });
            },
            "data.layout"(val){
                //处理父子组件回调事件
                this.data.layout && this.data.layout.forEach((o) => {
                    o.input = (v)=>{this.$set(this.result, o.dataField, v)}
                });
            }
        },
        mounted() {
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });

            let pageParam = this.$getPageParams();
            //this.$alert(this.widgetParams);
            let formId
            if(this.widgetParams.form) {
                formId = this.widgetParams.form.id//pageParam.formId;
            }
            //delete pageParam.formId;
            // Below are optional
            if(this.widgetParams.dataId) {
                this.entityId = this.widgetParams.dataId.from||this.widgetParams.dataId//this.widgetParams.dataId//pageParam.entityId;
            }
            //delete pageParam.entityId;
            if (pageParam.readOnly
                && pageParam.readOnly !== 'false'
                && pageParam.readOnly !== '0') {
                delete pageParam.readOnly;
                this.readOnly = true;
            }

            // After deleting those checked properties, use the rest of pageParam as queryParam
            this.queryParam = pageParam;

            let readRuntimeConfigPromise;

            if (!formId) {
                this.$alert('缺少参数 formId');
                return;
            }
            let contextPath = this.$getContextPath();
            readRuntimeConfigPromise = config.readRuntimeConfig(contextPath).then(runtimeConfig => {
                service.init(runtimeConfig.configServerUrl)
                console.log('fetch data')
                // 获取表单定义
                return service.getMetaFormDef(formId).then(formDef => {
                    this.data = formDef;
                    this.entityName = formDef.metaEntityName.toLowerCase();
                    metabase.initMetabase(formDef.projectId,true).then(ddd=>{
                        this.metaEntity = metabase.findMetaEntity(formDef.metaEntityName);
                    })

                    return service.getEngineUrl(formDef.projectId).then(engineUrl => {
                        this.engineUrl = engineUrl;
                        if (!this.entityId) {
                            // 在非编辑实体的情况下，才fetch defaultValues
                            this.data.layout.forEach(o => {
                                if (o.componentParams.valueType === 'defaultValue') {
                                    this.requestDefaultValueParam = this.requestDefaultValueParam || {};
                                    this.requestDefaultValueParam[o.dataField] = null;
                                }
                            })
                            if (this.requestDefaultValueParam) {
                                this.fetchCalcDefaultValues();
                            }
                        }

                        // 获取 swagger 定义
                        service.getSwaggerEntityDef(engineUrl, this.entityName).then(entityDef => {
                            this.swaggerEntiyDef = entityDef;
                        })

                        // 在编辑实体的情况下，才获取实体数据
                        if (this.entityId) {
                            this.result.id = this.entityId;
                            service.getEntityDataForId(engineUrl, this.entityName, this.entityId).then(data => {
                                this.existedRecord = data;
                                this.permObj = perm.parseBits(data.permVal);
                                this.processing();//实行表单数据处理
                            })
                        }
                    })
                });
            });
            /*readRuntimeConfigPromise.then(() => {
            }).catch(err => {
                console.log(err)
                this.$alert('Fetch data failed: ' + JSON.stringify(err));
            })*/

        }
    }
</script>
