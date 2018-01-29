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
    import EventBus from '../js/bus.js'
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    const modal = weex.requireModule('modal');
    var stream = weex.requireModule('stream');
    const data = require('../demoData.json')

    var createFormGroup = function(input, label, h) {

        let children = [];
        if (label) {
            children.push(h("text", {
                'class': ["form-label"],
            }, label))
        }
        if (input) children.push(input);
        let formGroup = h("div", {
            'class': ['form-group']
        }, children);
        return formGroup;
    }

    module.exports = {
        render(h) {
            console.log('rendering')
            this.validationRefs = this.validationRefs || [];
            let forms = [];
            // 遍历 layout 里的所有表单项
            this.data.layout && this.data.layout.forEach((o) => {
                let label = o.componentParams.title || o.dataField;
                let input;

                switch (o.componentType) {
                    case 'SingleLineText': {
                        let singleLineText = h('single-line-text', {
                            props: {
                                definition: o,
                            },
                            on: {
                                input: (v) => {
                                    this.result[o.dataField] = v; // TODO: this.$set
                                }
                            },
                            ref: o.id
                        });
                        if (o.componentParams.validation && o.componentParams.validation.validate) {
                            this.validationRefs.push(o.id);
                        }
                        forms.push(singleLineText);
                        break;
                    }
                    case 'MultiLineText': {
                        let multiLineText = h('multi-line-text', {
                            props: {
                                definition: o,
                            },
                            on: {
                                input: (v) => {
                                    this.result[o.dataField] = v; // TODO: this.$set
                                }
                            },
                            ref: o.id
                        });
                        if (o.componentParams.validation && o.componentParams.validation.validate) {
                            this.validationRefs.push(o.id);
                        }
                        forms.push(multiLineText);
                        break;
                    }
                    case "Boolean": {
                        let b = h("boolean", {
                            props: {
                                definition: o,
                            },
                            on: {
                                input: (v) => {
                                    this.result[o.dataField] = v; // TODO: this.$set
                                }
                            },
                        });
                        forms.push(b);
                        break;
                    }
                    case "RadioButton": {
                        // 读取默认值
                        if (!this.result[o.dataField]) o.componentParams.options.forEach(option => {
                            if (option.checked) {
                                this.$set(this.result, o.dataField, option.id);
                                return;
                            }
                        });

                        let r = h("radio-button", {
                            props: {
                                definition: o,
                                wholeDefinition: this.data,
                                value: this.result[o.dataField],
                            },
                            on: {
                                input: (v) => {
                                    // console.log('radio-button on input: ' + v);
                                    this.$set(this.result, o.dataField, v);
                                }
                            },
                        });
                        forms.push(r);
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
                        let g = h("checkbox-group", {
                            props: {
                                definition: o,
                                value: this.result[o.dataField],
                            },
                            on: {
                                input: (v) => {
                                    // console.log('checkbox-group on input: ' + v);
                                    this.$set(this.result, o.dataField, v);
                                }
                            },
                        });
                        forms.push(g);
                        break;
                    }
                    case 'NumberInput': {
                        input = h("input", {
                            class: ['form-input'],
                            on: {
                                input: (event) => {
                                    this.result[o.dataField] = event.value;
                                }
                            },
                            attrs: {
                                type: 'number',
                                placeholder: '请输入数字'
                            }
                        });
                        if (input) forms.push(createFormGroup(input, label, h));
                        break;
                    }

                    case 'Date': {
                        input = h("input", {
                            class: ['form-input'],
                            on: {
                                change: (e) => {
                                    this.result[o.dataField] = e.value;
                                }
                            },
                            attrs: {
                                type: 'date',
                                placeholder: '请输入日期'
                            }
                        });
                        if (input) forms.push(createFormGroup(input, label, h));
                        break;
                    }
                    case 'DateTime': {
                        break;
                        input = h("input", {
                            class: ['form-input'],
                            on: {
                                change: function(e) {
                                    this.result[o.dataField] = e.value;
                                }
                            },
                            attrs: {
                                type: 'datetime', // BUG: datetime 不生效
                                placeholder: '请输入日期时间'
                            }
                        });
                        if (input) forms.push(createFormGroup(input, label, h));
                        break;
                    }
                    case 'SingleSelect':
                    default: {
                        break;
                        input = h('text', ['[组件待实现]'])
                        if (input) forms.push(createFormGroup(input, label, h));
                        break;
                    }

                }
            });

            // 用 scroller 将 forms 包起来
            forms = h('scroller', {
                'class': ['scroller']
            }, forms);

            // 标题
            let titleDiv = h('bui-header', {
                attrs: {
                    title: this.data.title + ' - 表单预览',
                    leftItem: {
                        icon: 'icon-back'
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
                        this.validationRefs.forEach(id => {
                            let result = this.$refs[id].validate();
                            if (!result) {
                                this.$toast('验证出错')
                                validated = false;
                                return;
                            }
                        })
                        if (!validated) {
                            return;
                        }
                        this.$toast(JSON.stringify(this.result));
                    }
                }
            }, ['提交'])

            let refreshButton = h('text', {
                'class': ['action-button'],
                on: {
                    click:() => {
                        this.result = {};
                        this.fetchData();
                        return;
                        dataIndex = (dataIndex + 1) % datas.length
                        this.data = datas[dataIndex];
                    }
                }
            }, ['更新'])

            let actionBar = h('div', {
                'class': ['action-bar']
            }, [submitButton, refreshButton]);

            return h('div', {
                'class': ['container'],
            }, [titleDiv, forms, actionBar]);
        },
        methods: {
            fetchData() {
                stream.fetch({
                    method: 'GET',
                    url: 'https://developer.bingosoft.net:12100/metad/api/meta_form/8ZSKAtPztWDHMqmTFsNAjL?resolve=true',
                    type: 'json',
                    headers: {
                        'Authorization': 'Bearer de4f39eb-0c41-4261-acb5-432ba30bd26f'
                    }
                }, (resp) => {
                    if (!resp.ok) {
                        this.$toast('Fetch data failed: ' + JSON.stringify(resp.data));
                        return;
                    }
                    this.data = resp.data;
                })
            }
        },
        data () {
            return {
                result: {
                },
                data: data,
                // data: {}
            }
        },
        mounted()
        {
            // this.fetchData();
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
        },
        components: {
            'single-line-text': require('../components/single-line-text.vue'),
            'multi-line-text': require('../components/multi-line-text.vue'),
            'boolean': require('../components/boolean.vue'),
            'radio-button': require('../components/radio-button.vue'),
            'checkbox-group': require('../components/checkbox-group.vue'),
        },
    }
</script>
