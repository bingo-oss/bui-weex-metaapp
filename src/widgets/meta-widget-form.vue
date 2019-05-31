<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>
<style src="../styles/common.css"></style>
<style lang="css">
    .page-title-wrapper {
        flex-direction: row;
        flex: 1;
    }

    .page-title {
        flex: 1;
        height: 90px;
        text-align: center;
        line-height: 90px;
        font-size: 32px;
        color: #fff;
    }

    .action-bar {
        border-top-color: #e6e4e4;
        border-top-width: 1px;
        border-top-style: solid;
        padding-top: 15px;
        padding-bottom: 15px;
        padding-left: 10px;
        padding-right: 10px;
        flex-direction: row;
    }

    .slider-item {
        flex-direction: column;
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

    .action-button-text {
        flex: 1;
        text-align: center;
        font-size: 34px;
        color: #86868D;
        border-left-color: #BEBCBC;
        border-left-width: 1px;
        border-left-style: solid;
    }

    .widget-operation {
        background-color: #000;
    }

    .process_foot {
        padding-top: 15px;
        padding-left: 15px;
        padding-right: 15px;
    }

    .panel {
        margin-bottom: 20px;
        background-color: #fff;
        border-color: #E5E5E5;
        border-width: 1px;
    }

    .panel-header {
        font-size: 30px;
        font-weight: bold;
        padding-top: 20px;
        padding-bottom: 20px;
        padding-left: 30px;
        padding-right: 30px;
    }

    .panel-body {
        padding-top: 30px;
        padding-bottom: 20px;
        padding-left: 30px;
        padding-right: 30px;
    }

    .panel-body-form {
        padding-left: 10px;
        padding-right: 10px;
    }

    .scroller {
        flex: 1;
    }

    .mt6 {
        margin-top: 6px;
    }

    .font28 {
        font-size: 28px;
    }

    .color-sub {
        flex: 1;
        color: #666;
    }

    .approval-trail-title {
    }

    .approval-trail {
        /*
                flex:1;
        */
        padding-top: 20px;
        padding-left: 20px;
    }

    .approval-trail-w {
        flex-direction: column;
        border-left-style: solid;
        border-left-width: 1px;
        border-left-color: #DFDFDF;
        padding-left: 60px;
        padding-bottom: 40px;
    }

    .approval-trail-details {
        margin-top: 10px;
        flex-direction: column;
    }

    .approval-trail-info {
        width: 700px;
    }

    ._dot {
        position: absolute;
        width: 22px;
        height: 22px;
        background-color: #5099F4;
        border-radius: 22px;
        left: 0;
    }

    .view-label {
        font-size: 30px;
    }

    .form-hrt {
        border-top-color: #e6e4e4;
        border-top-width: 1px;
        border-top-style: solid;
    }

    .form-div {
        justify-content: flex-start;
        align-items: flex-start;
        padding-bottom: 20px;
        padding-top: 20px;
    }

</style>
<template>
    <div class="container full-column">
        <!--<bui-header v-if="!widgetParams.hideHeader" :leftItem="{icon: 'ion-ios-arrow-left'}" :title="title" @leftClick="() =>{this.$pop()}" :backgroundColor="themeBg">
            <div slot="right" class="header-right-wrapper">
                <div class="header-button">
                    &lt;!&ndash;头部为上拉菜单操作区域&ndash;&gt;
                    <template v-if="mobileHeaderOperations().length===1">
                        <meta-operation  btn-type="icon" :operation="mobileHeaderOperations()[0]" :widget-context="getWidgetContext()"></meta-operation>
                    </template>
                    <bui-icon v-if="mobileHeaderOperations().length>1" name="ion-ios-more" color="white" @click="titleOperationClicked"></bui-icon>
                </div>
            </div>
        </bui-header>-->

        <bui-header v-if="widgetParams.showHeader" :leftItem="{icon: 'ion-ios-arrow-left'}"
                    @leftClick="() =>{this.$pop()}" :backgroundColor="themeBg">
            <div slot="center" class="page-title-wrapper">
                <text v-for="title in titles" class="page-title"
                      :style="{color:(title.highlight?highlight.color:'#ccc')}"
                      @click="goto(title.type)">
                    {{widgetParams.headerTitle?widgetParams.headerTitle:title.name}}
                </text>
            </div>
        </bui-header>


        <scroller class="container" style="background-color: #F8F8F8;">
            <div class="panel" v-if="fields.length" @appear="appear('form')"
                 @disappear="disappear('form')" :ref="'form'">
                <div class="scrollerDiv" v-for="o in data.layout" :key="o.dataField">
                    <!--<text>o.dataField == {{o}}</text>-->
                    <component style="padding-right: 15px; padding-left: 15px;"
                               :is="'Meta'+o.inputType"
                               :definition="o"
                               :wholeDefinition="data"
                               @input="o.input"
                               :force-view="forceView"
                               @exDataChanged="exDataChanged"

                               :value="result[o.dataField]"
                               :ref="o.id"
                               :entityResourceUrl="o.componentParams.entityResourceUrl"
                               :field-setting="fieldSetting(o)"
                               :model="result"
                    ></component>
                </div>
            </div>
            <div class="panel" v-if="attachment.length" @appear="appear('attachment')"
                 @disappear="disappear('attachment')" :ref="'attachment'">
                <!--<text class="panel-header">附件</text>-->
                <meta-widget-attachment :widget-params="{dataId:entityId}"></meta-widget-attachment>
                <meta-widget-form-article
                        :widget-params="{dataId:entityId}"></meta-widget-form-article>
            </div>

            <div class="panel" v-if="trail.length" @appear="appear('trail')"
                 @disappear="disappear('trail')" :ref="'trail'"></div>

        </scroller>
        <!--<list class="scroller" v-if="!widgetParams.hideHeader">
            <cell class="scrollerDiv" v-for="o in data.layout" :key="o.id">
                <component :is="'Meta'+o.componentType"
                           :ref = "o.id"
                           :definition = "o"
                           :value =  "result[o.dataField]"
                           :wholeDefinition =  "data"
                           :entityResourceUrl =  "o.componentParams.entityResourceUrl"
                           :field-setting="fieldSetting(o)"
                           @input="o.input"
                           :force-view="forceView"
                           :model="result"
                           @exDataChanged="exDataChanged"
                ></component>
            </cell>
        </list>-->

        <!--表单底部为公共操作区域-->
        <!--        <div class="action-bar" v-if="widgetParams.editOperations||widgetParams.viewOperations">
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
                </div>-->
        <!--        <div class="action-bar" v-if="widgetParams.bottomOperations">
                    <template v-for="(commonOpt,index) in [].concat(widgetParams.bottomOperations)">
                        <meta-operation :key="index" class="full-column" :operation="commonOpt" :widget-context="getWidgetContext">
                            <div class="action-button">
                                <text class="action-button-text">{{commonOpt.title}}</text>
                            </div>
                        </meta-operation>
                    </template>
                </div>-->
        <!--表单底部为公共操作区域-->
        <div class="action-bar"
             v-if="widgetParams.bottomOperations&&widgetParams.bottomOperations.length">
            <meta-operation v-for="(commonOpt,index) in widgetParams.bottomOperations"
                            :operation="commonOpt"
                            :widget-context="getWidgetContext()"
                            @triggered="actionsheetTriggered"
                            @successed="actionsheetSuccessed"
                            :key="index" class="full-column" style="flex: 1"></meta-operation>
        </div>


        <!--下拉弹出窗口-->
        <actionsheet-wrapper ref="actionsheet" v-model="showActionsheet">
            <div v-for="(commonOpt,index) in mobileHeaderOperations()" :key="index">
                <meta-operation class="full-column" btn-type="dropdown"
                                :operation="actionsheetStyle(commonOpt,index)"
                                :widget-context="getWidgetContext()"
                                @triggered="actionsheetTriggered"
                                @successed="actionsheetSuccessed"></meta-operation>
            </div>
        </actionsheet-wrapper>

    </div>
</template>

<script>
    import ajax from '../js/ajax.js'
    import _ from '../js/tool/lodash.js'
    import service from '../js/service.js'
    import config from '../js/config.js';
    import perm from '../js/perm.js';
    import buiweex from 'bui-weex';
    import allComponents from '../components/all-components';
    import metabase from '../js/metadata/metabase.js';
    import Utils from '../js/tool/utils';
    import factoryApp from './libs/factory-app.js';
    import engineService from '../js/services/engine/engineservice.js';
    import EventBus from '../js/bus';

    Vue.use(allComponents);
    Vue.use(buiweex);

    const globalEvent = weex.requireModule('globalEvent');

    module.exports = {
        props: {
            widgetParams: {
                type: Object,
                required: true
            }
        },
        methods: {
            goto(ref) {
                //滚到指定区域
                this.gotoOpt = true;
                _.each(this.titles, (title) => {
                    if (title.type == ref) {
                        title.highlight = true;
                    } else {
                        title.highlight = false;
                    }
                });
                const el = this.$refs[ref];
                dom.scrollToElement(el, {});
                this.gotoOpt = false;
            },
            appear(type) {
                //滚到特定区域触发
                /*_.each(this.titles,(title)=>{
                 if(title.type==type){
                 title.highlight = true;
                 }else{
                 title.highlight = false;
                 }
                 });*/
                //buiweex.alert(type);
            },
            disappear(type) {
                //离开某个组件
                if (this.gotoOpt) return
                _.each(this.titles, (title, index) => {
                    if (title.type == type) {
                        title.highlight = false;
                        this.titles[((index - 1) < 0) ? (index + 1) : (index - 1)].highlight = true;//上一个为高亮
                    }
                });
            },
            fieldSetting(item) {

                var dataField = item.dataField;
                if (!dataField) {
                    return {};
                }
                return this.widgetParams
                    && this.widgetParams.fieldSettings
                    && this.widgetParams.fieldSettings[dataField];
            },
            successed(optType) {
                if (optType === "del") {//删除成功后返回
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
            input(v) {
                this.$refs.forEach((o) => {
                });
                //return (v)=>{ _t.$alert(v);_t.$set(_t.result,dataField, v)}
                //this.$alert(dataField);
                //this.$set(this.result, o.dataField, v);
            },
            ignoreReadonlyFields() {//过滤掉不需要提交到后台的数据
                let _model = {};
                let _this = this;
                _.each(_this.result, function (v, k) {
                    let metaField = _this.metaEntity.findField(k);
                    if (metaField && metaField.readonly) {
                        //readonly字段不提交
                    } else {
                        _model[k] = v;
                    }
                });
                return _model;
            },
            //返回所有字段组件
            getAllFieldItems() {
                var formItems = [];
                _.each(this.data.layout, function (formItem) {
                    if (formItem.isContainer && formItem.children && formItem.children.length > 0) {
                        _.each(formItem.children, function (child) {
                            if (child.isDataField) {
                                formItems.push(child);
                            }
                        });
                    } else {
                        if (formItem.isDataField) {
                            formItems.push(formItem);
                        }
                    }
                });
                return formItems;
            },
            getToUpdateModel() {//更新模型只包含表单有的数据
                let _model = this.ignoreReadonlyFields();
                let formItems = this.getAllFieldItems();
                let _toUpdateModel = {};
                _.each(formItems, function (v) {
                    let name = v.dataField;
                    if (_model[name]) {
                        _toUpdateModel[name] = _model[name];
                    }
                });
                _toUpdateModel[this.entityModelRedundantKey] = _model[this.entityModelRedundantKey];
                return _toUpdateModel;
            },
            doSaveModel() {
                //通用保存操作后的回调方法,内置的保存逻辑
                return new Promise((resolve, reject) => {
                    if (!this.formCheck()) {
                        reject();
                        return;
                    }
                    factoryApp.startLoading(this);//显示加载圈
                    // 编辑或保存成功后，直接 this.$pop() 返回上一页
                    // https://jira.bingosoft.net/browse/LINKSUITE-413
                    if (this.entityId) {
                        let _model = this.getToUpdateModel();
                        service.updateEntity(this.engineUrl, this.entityName, this.entityId, _model).then(data => {
                            resolve(data);
                            //嵌入使用时，不弹出提示
                            if (!this.widgetParams.embedded) {
                                this.$toast('编辑成功');
                                factoryApp.stopLoading(this);//关闭加载圈
                            }
                        }).catch(err => {
                            reject();
                            //this.$alert(err);
                            this.$toast("已归档,不可操作!")
                            factoryApp.stopLoading(this);//关闭加载圈
                        });
                    } else {
                        // 对于 this.queryParam 里的 query，遇到属于实体字段的 query 要在创建实体时带上
                        let postData = this.ignoreReadonlyFields();

                        // for (let k in this.swaggerEntiyDef.properties) {
                        for (let k in this.metaEntity._model.properties) {
                            if (this.queryParam[k]) {
                                postData[k] = this.queryParam[k];
                            }
                        }
                        service.createEntify(this.engineUrl, this.entityName, this.queryParam, postData).then(data => {
                            resolve(data);
                            if (!this.widgetParams.embedded) {
                                this.$toast('创建成功');
                            }
                            factoryApp.stopLoading(this);//关闭加载圈
                        }).catch(err => {
                            reject();
                            this.$alert(err);
                            factoryApp.stopLoading(this);//关闭加载圈
                        });
                    }
                });

            },
            titleOperationClicked() {
                this.showActionsheet = true;
            },
            actionsheetTriggered(type) {
                //针对下拉菜单显隐处理--部件类型操作比较特殊
                if (type == "widget") {
                    this.$refs.actionsheet.hide();
                } else {
                    this.$refs.actionsheet._maskClick()
                }

                if (type == "script") {
                    this.formCheck();//表单校验
                }
            },
            actionsheetSuccessed(type) {
                //针对下拉菜单显隐处理--部件类型操作比较特殊
                this.$refs.actionsheet._maskClick()
            },
            actionsheetStyle(item, index) {
                //处理按钮样式
                item.style = {
                    "color": "#4CA4FE",
                    "font-size": "30px"
                }
                return item;
            },
            mobileHeaderOperations() {
                var opts = (this.widgetParams && this.widgetParams.actionsheetOperation);
                //下拉菜单操作
                var _opts = [];
                _.each(opts, function (opt) {
                    var terminalType = opt[Utils.operationTermimalTypeField];
                    if (terminalType !== 1) {
                        _opts.push(opt);
                    }
                });
                return _opts;
            },
            //表单记录扩展数据填充，如选择用户之后用户名称存储、选项类型其他选项对应的填写值等
            exDataChanged: function (newValue, dataField) {
                let model = this.result;
                if (dataField) {
                    let rkey = this.entityModelRedundantKey;
                    model[rkey] = model[rkey] || {};
                    model[rkey][dataField] = model[rkey][dataField] || {};
                    model[rkey][dataField] = newValue;
                }

            },
            submit() {//页面部件提交方法
                return this.doSaveModel();
            },
            getData() {//页面部件获取表单数据方法
                return this.ignoreReadonlyFields()
            },
            formCheck() {//页面部件执行校验
                var validated = true;
                try {
                    for (let id in this.$refs) {
                        //if(["actionsheet"].indexOf(id)!=-1)continue;//过滤下拉菜单组件
                        let validateFunc = this.$refs[id] && this.$refs[id][0] && this.$refs[id][0].validate;
                        if (!validateFunc) {
                            continue;
                        }
                        let result = validateFunc();
                        if (!result) {
                            validated = false;
                            continue;
                            //break;
                        }
                    }
                } catch (erro) {
                    validated = false;
                }
                return validated;
            },
            getAttachment(dataId) {
                //获取附件
                let _t = this;
                config.readRuntimeConfig().then(runtimeConfig => {
                    ajax.get(`${runtimeConfig["service.metad.api.endpoint"]}/mp_attachment`, {
                        filters: `businessKey eq ${dataId}`,
                        orderby: "displayOrder asc"
                    }).then(res => {
                        if (res.data && res.data.length) {
                            _t.attachment = res.data;
                            _t.titles.push({
                                name: "附件",
                                type: "attachment",
                                highlight: false,
                                data: "attachment"
                            })
                        }
                    });
                })
            },
            getWidgetContext() {
                //传入操作的上下文内容
                return {
                    "form": this,
                    "model": this,
                    "metaEntity": this.metaEntity?this.metaEntity:"",
                    "metaEntityId": this.metaEntity?this.metaEntity.metaEntityId:"",
                    "selectedId": this.entityId,
                    "selectedItem": this.result,
                    "widgetParams": this.widgetParams//部件参数
                }
            }
        },
        data() {
            let view = this.widgetParams.mode || "";
            return {
                fields: [1],
                attachment: [],
                trail: [],//流程轨迹
                titles: [
                    {
                        name: "详情",
                        type: "form",
                        highlight: true,
                        data: "fields"
                    }
                ],
                highlight: {
                    //高亮属性
                    color: "#fff"
                },
                entityModelRedundantKey: '_data',
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
                innerPermissions: {
                    openEdit: true,//开启编辑按钮权限
                    edit: true,//修改或者保存按钮权限
                    del: true,//删除按钮权限
                    cancel: true,//取消按钮
                    view: view
                },
                metaForm: "",
                metaEntity: {},
                showActionsheet: false,
                loadingText: ""
            }
        },
        computed: {
            getDeviceHeight() {
                return (750 / (weex.config.env.deviceWidth)) * weex.config.env.deviceHeight
            },
            title() {
                let _title = "新建";
                if (this.innerPermissions.view) {
                    _title = "查看"
                } else if (this.entityId) {
                    _title = "编辑"
                }
                return _title;
            },
            forceView() {
                return !!this.widgetParams.forceView;
            }
        },
        watch: {
            title() {
                //EventBus.$emit("widget-push-title",this.title);
            },
            defaultValues(val) {
                // 将默认值 merge 到当前 result 里
                for (let k in val) {
                    if (this.result[k] === undefined) {
                        this.$set(this.result, k, val[k]);
                    }
                }
            },
            "permObj"(val) {
                let _t = this;
                Object.assign(_t.innerPermissions, {
                    "openEdit": !val.canRead,
                    "cancel": val.canCreate,
                    "edit": val.canEdit,
                    "del": val.canDelete
                })
            },
            "existedRecord"(val) {
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
                this.$forceUpdate();//更新下视图
            },
            "data.layout": {
                immediate: true,
                handler: function () {
                    //处理父子组件回调事件
                    let _t = this;
                    this.data.layout && this.data.layout.forEach((o) => {
                        o.dataField = o.name
                        o.input = (v) => {
                            this.$set(this.result, o.dataField, v);
                            this.$forceUpdate();//更新下视图
                        }
                    });
                }
            }
        },
        mounted() {
            var _this = this
            EventBus.$emit("widget-push-title", "")
            //EventBus.$emit("widget-push-title",this.title);
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });

            let pageParam = this.$getPageParams();
            //this.$alert(this.widgetParams);
            let formId
            if (this.widgetParams.form) {
                formId = this.widgetParams.form.id//pageParam.formId;
            }
            //delete pageParam.formId;
            // Below are optional
            if (!_.isEmpty(this.widgetParams.dataId) && this.widgetParams.dataId != "undefined") {
                this.entityId = this.widgetParams.dataId.from || this.widgetParams.dataId//this.widgetParams.dataId//pageParam.entityId;
                this.getAttachment(this.entityId)
            } else {
                this.titles[0].name = "新建"
            }
            //delete pageParam.entityId;
            if (pageParam.readOnly
                && pageParam.readOnly !== 'false'
                && pageParam.readOnly !== '0') {
                delete pageParam.readOnly;
                this.readOnly = true;
            }
            pageParam.title = "";//不需要传入标题
            // After deleting those checked properties, use the rest of pageParam as queryParam
            this.queryParam = pageParam;

            let readRuntimeConfigPromise;

            let mobileType = "";
            if ((weex.config.env.deviceModel.indexOf("iPhone") != -1)) {
                mobileType = 2;
            } else if ((weex.config.env.deviceModel.indexOf("iPhone") == -1)) {
                mobileType = 1;
            }
            let setData = {terminalType: mobileType, resolve: true};
            if (!formId && pageParam.entity) {
                //不存在视图id--则存入实体id
                setData.getDefaultForm = true;
                formId = pageParam.entity;
            }
            /*if (!formId) {
                this.$alert('缺少参数 formId');
                return;
            }*/
            let contextPath = this.$getContextPath();
            factoryApp.startLoading(this);//显示加载圈


            readRuntimeConfigPromise = config.readRuntimeConfig(contextPath).then(runtimeConfig => {
                service.init(runtimeConfig.configServerUrl)
                console.log('fetch data')
                // 获取表单定义
                config.getMetabase().then(metabase => {
                    _this.metaEntity = metabase.findMetaEntity(_this.widgetParams.form.entityName);
                    _this.entityName = _this.widgetParams.form.entityName
                    var engineUrl = _this.metaEntity.engineUrl
                    _this.metaEntity.resourceUrl = `${engineUrl}/${_this.metaEntity.entityPath}`//存储引擎地址
                    // console.log('HXB', 'entity==' + JSON.stringify(_this.metaEntity))
                    _this.metaEntity.getPage(_this.widgetParams.form.id).then(res => {
                        _this.data = res
                        _this.data.layout.forEach(o => {
                            if (o.componentParams.valueType === 'defaultValue') {
                                this.requestDefaultValueParam = this.requestDefaultValueParam || {};
                                this.requestDefaultValueParam[o.dataField] = null;
                            }
                        });
                    });
                    if (!_this.entityId) {
                        // 在非编辑实体的情况下，才fetch defaultValues
                        if (_this.requestDefaultValueParam) {
                            _this.fetchCalcDefaultValues();
                        }
                         let _formDefaultValues = _this.widgetParams.formDefaultValues
                        if (_formDefaultValues) {
                            try {
                                if (_.isString(_formDefaultValues)) {
                                    _formDefaultValues = eval('(' + _formDefaultValues + ')');
                                }
                            } catch (e) {
                                console.log("脚本输出参数语法错误")
                                console.log(e)
                            }
                            /*if(_.isString(_formDefaultValues)){
                                _formDefaultValues = JSON.parse(_formDefaultValues);
                            }*/
                            this.defaultValues = _formDefaultValues;
                        }//传入了表单默认值了
                    }


                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //这里获取到的entityDef只用到了properties，而properties基本跟entity的_model.properties一样，目前先改用entity的_model.properties
                    // 获取 swagger 定义
                    // service.getSwaggerEntityDef(engineUrl, _this.entityName).then(entityDef => {
                    //     _this.swaggerEntiyDef = entityDef;
                    // })
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


                    // 在编辑实体的情况下，才获取实体数据
                     if (this.entityId) {
                         //this.result.id = this.entityId;
                         service.getEntityDataForId(engineUrl, _this.metaEntity.entityPath, this.entityId).then(data => {
                             this.existedRecord = data;
                             this.permObj = perm.parseBits(data.permVal);
                         });
                     }
                    factoryApp.stopLoading(this);//关闭加载圈


                    // metabase.initMetabase(_this.metaEntity.projectId, true).then(ddd => {
                    //     this.metaEntity = metabase.findMetaEntity(formDef.metaEntityName);
                    //     this.metaEntity.metaEntityId = formDef.metaEntityId;//存入实体id
                    //     this.metaEntity.resourceUrl = `${this.engineUrl}/${metabase.lowerUnderscore(this.entityName)}`//存储引擎地址
                    // })
                })
            });

        },
        created() {
            factoryApp.init(this);//初始化全局api的指向
        }
    }
</script>
