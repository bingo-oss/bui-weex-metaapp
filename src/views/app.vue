<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>
<style src="../styles/common.css"></style>

<style lang="css">
    .container {
        flex-direction: column;
        align-items: stretch;
    }

    .scroller {
        padding-left: 20px;
        padding-right: 20px;
        flex: 1;
    }

    .action-bar {
        height: 100px;
        flex-direction: row;
        align-items: center;
        background-color: #F9F9F9;
    }

    .action-button {
        flex: 1;
        font-size: 40px;
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

</style>

<script>
    import ajax from '../js/ajax.js'
    import service from '../js/service.js'
    import config from '../js/config.js';
    import perm from '../js/perm.js';

    const globalEvent = weex.requireModule('globalEvent');
    // const data = require('../demoData.json')

    module.exports = {
        render(h) {
            console.log('rendering')
            let forms = [];
            // 遍历 layout 里的所有表单项
            this.data.layout && this.data.layout.forEach((o) => {
                // let input;
                if (this.existedRecord[o.dataField] !== undefined
                    && this.result[o.dataField] === undefined) {
                    // 将已有记录里的值填充进 result 里
                    this.$set(this.result, o.dataField, this.existedRecord[o.dataField]);
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

                // 以下为所有组件通用逻辑
                //
                // 对于像 Description 这样的组件，本来不需要传 value 或者 on input 这些参数，这里简单全传了
                let input = h(o.componentType, {
                    props: {
                        definition: o,
                        value: this.result[o.dataField],
                        wholeDefinition: this.data,
                    },
                    ref: o.id,
                    on: {
                        input: (v) => {
                            this.$set(this.result, o.dataField, v);
                        }
                    },
                })
                forms.push(input);
                // 以上为所有组件通用逻辑
            });

            // 用 scroller 将 forms 包起来
            forms = h('scroller', {
                'class': ['scroller']
            }, forms);

            // 标题
            let titleDiv = h('bui-header', {
                attrs: {
                    title: this.data.title,
                    leftItem: {
                        icon: 'ion-ios-arrow-back',
                    }
                },
                on: {
                    leftClick: () => {
                        this.$pop();
                    }
                }
            })

            // 底部
            let submitButton = h('text', {
                'class': ['action-button'],
                on: {
                    click:() => {
                        console.log('submit');
                        console.log(this.result);
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
                            return;
                        }
                        if (this.isPostingData) return;
                        this.isPostingData = true;
                        if (this.entityId) {
                            service.updateEntity(this.engineUrl, this.entityName, this.entityId, this.result).then(data => {
                                this.$toast('编辑成功');
                                this.isPostingData = false;
                            }).catch(err => {
                                this.$alert(err);
                                this.isPostingData = false;
                            });
                        } else {
                            // 对于 this.queryParam 里的 query，遇到属于字段的 query 要在创建实体时带上
                            let postData = Object.assign({}, this.result);
                            for (let k in this.swaggerEntiyDef.properties) {
                                if (this.queryParam[k]) {
                                    postData[k] = this.queryParam[k];
                                }
                            }
                            service.createEntify(this.engineUrl, this.entityName, this.queryParam, postData).then(data => {
                                this.$toast('创建成功');
                                this.isPostingData = false;
                            }).catch(err => {
                                this.$alert(err);
                                this.isPostingData = false;
                            });
                        }
                    }
                }
            }, [this.submitTitle])

            let actionBar = h('div', {
                'class': ['action-bar']
            }, [submitButton]);

            let bodyParts = [titleDiv, forms];
            if (this.readOnly
                || (!this.permObj.canEdit && this.entityId)){
                console.log('不显示提交按钮')
            } else {
                bodyParts.push(actionBar);
            }
            return h('div', {
                'class': ['container'],
            }, bodyParts);
        },
        methods: {
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
            }
        },
        computed: {
            submitTitle() {
                return this.isPostingData ? '提交中...' : '提交';
            }
        },
        mounted() {
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });

            let pageParam = this.$getPageParams();
            // this.$alert(pageParam);

            let formId = pageParam.formId;
            delete pageParam.formId;
            // Below are optional
            this.entityId = pageParam.entityId;
            delete pageParam.entityId;

            if (pageParam.readOnly
                && pageParam.readOnly !== 'false'
                && pageParam.readOnly !== '0') {
                delete pageParam.readOnly;
                this.readOnly = true;
            }

            // After deleting those checked properties, use the rest of pageParam as queryParam
            this.queryParam = pageParam;

            let debug = config.debug;
            let readRuntimeConfigPromise;

            if (debug) {
                // this.entityId = config.debugEntityId;
                formId = formId || config.debugFormId;
                service.init(config.debugConfigUrl);
                readRuntimeConfigPromise = Promise.resolve();
            } else {
                if (!formId) {
                    this.$alert('缺少参数 formId');
                    return;
                }
                let contextPath = this.$getContextPath();
                readRuntimeConfigPromise = config.readRuntimeConfig(contextPath).then(runtimeConfig => {
                    service.init(runtimeConfig.configServerUrl)
                });
            }

            console.log('fetch data')
            readRuntimeConfigPromise.then(() => {
                return service.getMetaFormDef(formId).then(formDef => {
                    this.data = formDef;
                    this.entityName = formDef.metaEntityName;
                    return service.getEngineUrl(formDef.projectId).then(engineUrl => {
                        this.engineUrl = engineUrl;
                        service.getSwaggerEntityDef(engineUrl, this.entityName).then(entityDef => {
                            this.swaggerEntiyDef = entityDef;
                        })
                        if (this.entityId) {
                            service.getEntityDataForId(engineUrl, formDef.metaEntityName, this.entityId).then(data => {
                                this.existedRecord = data;
                                this.permObj = perm.parseBits(data.permVal);
                            })
                        }
                    })
                });
            })
            .catch(err => {
                console.log(err)
                this.$alert('Fetch data failed: ' + JSON.stringify(err));
            })
        },
        components: require('../components/all-components.js')
    }
</script>
