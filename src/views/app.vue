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
    }

</style>

<script>
    import ajax from '../js/ajax.js'
    import service from '../js/service.js'

    const globalEvent = weex.requireModule('globalEvent');
    const stream = weex.requireModule('stream');
    const data = require('../demoData.json')

    module.exports = {
        render(h) {
            console.log('rendering')
            this.validationRefs = this.validationRefs || {};
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
                    case 'SingleLineText':
                    case 'MultiLineText':
                    case 'NumberInput': {
                        this.validationRefs[o.id] = true;
                        break;
                    }
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
                        ref: o.id
                    },
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
                        for (let id in this.validationRefs) {
                            let result = this.$refs[id].validate();
                            if (!result) {
                                // this.$toast('验证出错')
                                validated = false;
                            }
                        }
                        if (!validated) {
                            // return;
                        }
                        // this.$alert(JSON.stringify(this.result));
                        // return;
                        if (this.entityId) {
                            service.updateEntity(this.engineUrl, this.entityName, this.entityId, this.result).then(data => {
                                this.$toast('编辑成功。')
                            }).catch(err => {
                                this.$alert(err);
                            });
                        } else {
                            service.createEntify(this.engineUrl, this.entityName, this.result).then(data => {
                                this.$toast('创建成功。')
                            }).catch(err => {
                                this.$alert(err);
                            });
                        }

                    }
                }
            }, ['提交'])

            let actionBar = h('div', {
                'class': ['action-bar']
            }, [submitButton]);

            return h('div', {
                'class': ['container'],
            }, [titleDiv, forms, actionBar]);
        },
        methods: {
        },
        data () {
            return {
                result: {},
                existedRecord: {},
                // data: data,
                data: {},
                engineUrl: '',
                entityId: '',
                entityName: '',
            }
        },
        mounted() {
            let pageParam = this.$getPageParams();

            var configUrl = pageParam.configUrl;
            var formId = pageParam.formId;
            // Below are optional
            this.entityId = pageParam.entityId;

            let debug = true;

            if (debug) {
                configUrl = configUrl || 'https://developer.bingosoft.net:12100/services/tool/system/config';
                formId = formId || 'nvhNdnUr6UkAXtS2WmV7AQ';
                // this.entityId = this.entityId || 'a52e91e1-dada-4e5b-8a3c-4578c3779e3d'
                // this.data = data;
            }

            console.log('fetch data')
            service.getMetaFormDef(configUrl, formId).then(formDef => {
                this.data = formDef;
                this.entityName = formDef.metaEntityName;
                service.getEngineUrl(configUrl, formDef.projectId).then(engineUrl => {
                    this.engineUrl = engineUrl;
                    if (this.entityId) {
                        service.getEntityDataForId(engineUrl, formDef.metaEntityName, this.entityId).then(data => {
                            this.existedRecord = data;
                        })
                    }
                })


            })
            .catch(err => {
                console.log(err)
                this.$toast('Fetch data failed: ' + JSON.stringify(err));
            })

            // this.fetchData();
            // globalEvent.addEventListener("androidback", e => {
            //     this.$pop();
            // });
        },
        components: require('../components/all-components.js')
    }
</script>
