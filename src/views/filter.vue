<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>
<style src="../styles/common.css"></style>

<style lang="css">
    .container {
        flex-direction: column;
        align-items: stretch;
        flex: 1;
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
        font-size: 34px;
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
    import config from '../js/config.js'

    const globalEvent = weex.requireModule('globalEvent');
    const stream = weex.requireModule('stream');

    module.exports = {
        data () {
            return {
                copiedFilters: Object.assign({}, this.filters)
            }
        },
        props: {
            filters: {},
            viewDef: null,
            swaggerEntiyDef: null,
        },
        render(h) {
            console.log('rendering filters view');

            let forms = [];
            // 遍历 layout 里的所有表单项
            this.viewDef && this.swaggerEntiyDef && this.viewDef.config.columns.forEach((col) => {
                if (!col.searchable) {
                    return;
                }
                let properties = this.swaggerEntiyDef.properties[col.name];
                if(!properties)return false;
                let inputType = properties['x-input']
                // 伪造 definition
                let fakeDefinition = {
                    dataField: col.name,
                    componentParams: {
                        title: properties.title
                    }
                }
                let entityResourceUrl;
                switch (inputType) {
                    case "RadioButton": {
                        let options = properties['x-options'].items.map(o => {
                            return {id: o.value + '', text: o.title}
                        });
                        fakeDefinition.componentParams.options = options;
                        break;
                    }
                    case "RefEntity": {
                        entityResourceUrl = properties.entityResourceUrl;
                        if (!entityResourceUrl) {
                            if (config.debug) {
                                this.$alert(`No entityResourceUrl for ${col.name}`)
                            } else {
                                console.log(`No entityResourceUrl for ${col.name}`)
                            }
                        }
                        break
                    }
                    case 'CheckboxGroup': {
                        // TODO
                        break;
                    }
                    case "SingleSelect": {
                        // TODO
                        break;
                    }

                    default: {
                        break;
                    }
                }

                let input = h(`Meta${inputType}`, {
                    props: {
                        definition: fakeDefinition,
                        filterValue: this.copiedFilters[col.name],
                        filterMode: true,
                        entityResourceUrl: entityResourceUrl,
                    },
                    on: {
                        filterInput: (v) => {
                            console.log(`setting ${v} for ${col.name}`)
                            this.$set(this.copiedFilters, col.name, v);
                        }
                    },
                })
                forms.push(input);
            });

            // 用 scroller 将 forms 包起来
            forms = h('scroller', {
                'class': ['scroller']
            }, forms);

            // 标题
            let titleDiv = h('bui-header', {
                attrs: {
                    title: '筛选设置',
                    leftItem: {
                        text: '取消',
                    }
                },
                on: {
                    leftClick: () => {
                        this.$emit('cancel')
                    }
                }
            })

            // 底部
            let submitButton = h('text', {
                'class': ['action-button'],
                on: {
                    click:() => {
                        // this.$alert(this.copiedFilters);
                        this.$emit('filter', this.copiedFilters);
                    }
                }
            }, ['筛选'])

            let resetButton = h('text', {
                'class': ['action-button'],
                on: {
                    click:() => {
                        this.copiedFilters = {};
                        this.$emit('filter', this.copiedFilters);
                    }
                }
            }, ['重置'])

            let actionBar = h('div', {
                'class': ['action-bar']
            }, [resetButton, submitButton]);

            return h('div', {
                'class': ['container'],
            }, [titleDiv, forms, actionBar]);
        }
    }
</script>
