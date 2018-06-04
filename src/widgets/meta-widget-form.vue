<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>
<style src="../styles/common.css"></style>
<template>
    <div class="container">
        <bui-header :leftItem="{icon: 'ion-chevron-left'}" :title="title" @leftClick="() =>{this.$pop()}"></bui-header>
        <list class="scroller" >
            <cell class="scrollerDiv" v-for="o in data.layout" :key="o.id" v-if="['SingleUserSelect','MultiUserSelect','SingleOrgSelect'].indexOf(o.componentType)==-1">
                <component :is="'Meta'+o.componentType"
                           :ref = "o.id"
                           :definition = "o"
                           :value =  "result[o.dataField]"
                           :wholeDefinition =  "data"
                           :entityResourceUrl =  "o.componentParams.entityResourceUrl"
                           @input="o.input"
                ></component>
            </cell>
        </list>
        <div class="action-bar" v-if="widgetParams.editOperations||widgetParams.viewOperations">
            <template  v-if="!innerPermissions.view" v-for="(commonOpt,index) in [].concat(widgetParams.editOperations)">
                <meta-operation @successed="successed" :key="index" class="full-column" :operation="commonOpt" :widget-context="getWidgetContext">
                    <div class="action-button">
                        <text class="action-button-text">{{commonOpt.title}}</text>
                    </div>
                </meta-operation>
            </template>

            <template v-if="innerPermissions.view" v-for="(commonOpt,index) in [].concat(widgetParams.viewOperations)">
                <meta-operation :key="index" class="full-column" :operation="commonOpt" :widget-context="getWidgetContext">
                    <div class="action-button">
                        <text class="action-button-text">{{commonOpt.title}}</text>
                    </div>
                </meta-operation>
            </template>
        </div>
    </div>
</template>
<style lang="css">
    .container {
        flex:1;
        flex-direction: column;
        align-items: stretch;
    }

    .scroller {
        padding-left: 20px;
        padding-right: 20px;
        flex: 1;
    }
    .scrollerDiv{
/*        padding-left: 20px;
        padding-right: 20px;*/
    }
    .action-bar {
        flex-direction: row;
    }
    .action-button {
        height: 100px;
        flex-direction: row;
        align-items: center;
        flex: 1;
        background-color: #F9F9F9;
        border-top-style: solid;
        border-top-width: 2px;
        border-top-color: #CCCCCC;
    }
    .action-button-text{
        flex: 1;
        text-align: center;
        font-size: 34px;
        color: #86868D;
        border-left-color: #BEBCBC;
        border-left-width: 1px;
        border-left-style: solid;
    }
    .widget-operation{
        background-color: #000;
    }

</style>

<script>
    import ajax from '../js/ajax.js'
    import _ from '../js/tool/lodash.js'
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
            successed(optType){
                if(optType==="del"){//删除成功后返回
                    this.$pop();
                }
            },
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
            ignoreReadonlyFields(){//过滤掉不需要提交到后台的数据
                let _model={};
                let _this=this;
                _.each(_this.result,function(v,k){
                    let metaField=_this.metaEntity.findField(k);
                    if(metaField&&metaField.readonly){
                        //readonly字段不提交
                    }else{
                        _model[k]=v;
                    }
                });
                return _model;
            },
            //返回所有字段组件
            getAllFieldItems(){
                var formItems=[];
                _.each(this.data.layout,function(formItem){
                    if(formItem.isContainer&&formItem.children&&formItem.children.length>0){
                        _.each(formItem.children,function(child){
                            if(child.isDataField){
                                formItems.push(child);
                            }
                        });
                    }else{
                        if(formItem.isDataField){
                            formItems.push(formItem);
                        }
                    }
                });
                return formItems;
            },
            getToUpdateModel(){//更新模型只包含表单有的数据
                let _model = this.ignoreReadonlyFields();
                let formItems = this.getAllFieldItems();
                let _toUpdateModel={};
                _.each(formItems,function(v){
                    let name=v.dataField;
                    if(_model[name]){
                        _toUpdateModel[name]=_model[name];
                    }
                });
                _toUpdateModel[this.entityModelRedundantKey]=_model[this.entityModelRedundantKey];
                return _toUpdateModel;
            },
            submit(){//页面部件提交方法
                return this.doSaveModel();
            },
            doSaveModel(){
                //通用保存操作后的回调方法,内置的保存逻辑
                return new Promise((resolve,reject)=>{
                    let validated = true;
                    for (let id in this.$refs) {
                        let validateFunc = this.$refs[id].validate;
                        if (!validateFunc) {
                            continue;
                        }
                        let result = validateFunc();
                        if (!result) {
                            validated = false;
                            break;
                        }
                    }
                    if (!validated) {
                        reject();
                        return;
                    }
                    // 编辑或保存成功后，直接 this.$pop() 返回上一页
                    // https://jira.bingosoft.net/browse/LINKSUITE-413
                    if (this.entityId) {
                        let _model=this.getToUpdateModel();
                        service.updateEntity(this.engineUrl, this.entityName, this.entityId, _model).then(data => {
                            resolve(data);
                            this.$toast('编辑成功');
                            this.$pop();
                        }).catch(err => {
                            reject();
                            this.$alert(err);
                        });
                    } else {
                        // 对于 this.queryParam 里的 query，遇到属于实体字段的 query 要在创建实体时带上
                        let postData = this.ignoreReadonlyFields();;
                        for (let k in this.swaggerEntiyDef.properties) {
                            if (this.queryParam[k]) {
                                postData[k] = this.queryParam[k];
                            }
                        }
                        service.createEntify(this.engineUrl, this.entityName, this.queryParam, postData).then(data => {
                            resolve(data);
                            this.$toast('创建成功');
                            this.$pop();
                        }).catch(err => {
                            reject();
                            this.$alert(err);
                        });
                    }
                });

            }
        },
        data () {
            let view = this.widgetParams.mode || "";
            return {
                entityModelRedundantKey:'_data',
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
                requestDefaultValueParam: null,
                defaultValues: {},
                innerPermissions:{
                    openEdit:true,//开启编辑按钮权限
                    edit:true,//修改或者保存按钮权限
                    del:true,//删除按钮权限
                    cancel:true,//取消按钮
                    view:view
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
            },
            title(){
                let _title = "新建";
                if(this.innerPermissions.view){
                    _title = "查看"
                }else if (this.entityId) {
                    _title = "编辑"
                }
                return _title;
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
                Object.assign(this.result,val);
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