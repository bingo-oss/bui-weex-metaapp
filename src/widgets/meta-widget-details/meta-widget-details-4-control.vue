<template>
    <div class="wrapper">
        <div class="details-header" v-if="headerInfo">
            <div class="escape" v-if="headerInfo.title">
                <text class="escape-in">{{headerInfo.title}}</text>
            </div>

            <div v-if="headerInfo.subTitle">
                <text class="warn">{{headerInfo.subTitle}}</text>
            </div>

        </div>

        <div style="padding-left: 25px;">
            <div class="compare-title">
                <text style="font-size: 28px;">相关信息</text>
            </div>

            <div>
                <div v-for="item in content"
                     class="flex-row" style="padding-bottom: 18px;">
                    <div style="width: 150px; margin-right: 20px; ">
                        <!--flex-direction:row-->
                        <text class="text_detail_title">{{item.title}}</text>
                    </div>
                    <div style="width: 500px">
                        <text class="text_detail_content">{{item.value}}</text>
                    </div>
                </div>
            </div>
        </div>

        <div style="padding-left: 25px;" v-if="data.data.forewarningStatus == 1">
            <div class="compare-title">
                <text style="font-size: 28px;">处理结果</text>
            </div>

            <div>
                <div v-for="item in processResultContent"
                     class="flex-row" style="padding-bottom: 18px;">
                    <div style="width: 150px; margin-right: 20px; ">
                        <!--flex-direction:row-->
                        <text class="text_detail_title">{{item.title}}</text>
                    </div>
                    <div style="width: 500px">
                        <text class="text_detail_content"
                              v-if="typeof item.value == 'string'">{{item.value}}
                        </text>
                        <div v-else
                             v-for="pic in item.value">
                            <image style="width: 170px;height: 220px;"
                                   :src="pic"
                            ></image>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import service from '../../js/service.js';
    import ajax from '../../js/ajax.js';
    import config from '../../js/config.js';
    import DetailsUtils from './js/DetailsUtils.js';
    import _ from '../../js/tool/lodash';
    import buiweex from "bui-weex";
    import metabase from '../../js/metadata/metabase.js';

    const globalEvent = weex.requireModule('globalEvent');
    import factoryApp from "../libs/factory-app";
    import linkapi from "linkapi"
    /*
    * 数据获取：通过实体id获取容器地址，拼接参数"数据id"去get
    *
    * 已经创建的实例，需要使用vue.set方法，才能响应data里的数据
    * */
    module.exports = {
        props: {
            widgetParams: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                titleInfo: {},  //详情顶部信息
                Config: config,
                metaEntit: {},
                data: {},
                headerInfo: {},
                content: [],
                entityTableInfo: {},//实体表信息
                processResult: {},//处理结果
                processResultContent: [],//处理结果（用于显示）
                processResultEntityTableInfo: []//实体表信息（处理结果）
            }
        },
        methods: {
            getDetailsInfo() {
                factoryApp.startLoading(this);//显示加载圈
                let _this = this;
                this.content = [];//清除下数据
                ajax.get(`${_this.metaEntit.project.engine.externalUrl}/${metabase.lowerUnderscore(_this.metaEntit.name)}/${_this.widgetParams.dataId}`)
                    .then(res => {
                        _this.data = res
                        var data = res.data
                        var _data = res.data._data
                        delete data._data
                        service.getEntityFields(
                            _this.metaEntit.projectId,
                            null,
                            _this.metaEntit.id
                        )
                            .then(fieldInfos => {
                                for (var index in fieldInfos) {
                                    var fieldInfo = fieldInfos[index]
                                    var field = {
                                        title: fieldInfo.title,
                                        inputType: fieldInfo.inputType,
                                        dataType: fieldInfo.dataType,
                                        columnType: fieldInfo.columnType
                                    }
                                    _this.entityTableInfo[fieldInfo.name] = field
                                }


                                //副标题
                                var sub = []
                                // var subTitleKeys = _this.widgetParams.key4subTitles ? _this.widgetParams.key4subTitles.split(',') : null
                                var subValueKeys = _this.widgetParams.Valueskey4SubTitles ? _this.widgetParams.Valueskey4SubTitles.split(',') : null
                                _this.headerInfo.subTitle = ''
                                // if (subTitleKeys && subValueKeys) {
                                //     for (var index in subTitleKeys) {
                                //         var titleKey = subTitleKeys[index]
                                //         var valueKey = subValueKeys[index]
                                //         var kv = {}
                                //         kv.titleKey = titleKey
                                //         kv.valueKey = valueKey
                                //         kv[titleKey] = null
                                //         kv[valueKey] = null
                                //         sub.push(kv)
                                //     }
                                //     DetailsUtils.findValuesByJSON(sub, res.data)
                                //     for (var index in sub) {
                                //         var value = sub[index]
                                //         var v = value[value.valueKey] == null ? '' : value[value.valueKey]
                                //         v = _this.transformData(v)
                                //         _this.headerInfo.subTitle += value[value.titleKey] + ':' + v + '    '
                                //     }
                                // } else
                                if (subValueKeys) {
                                    sub = DetailsUtils.findValuesByKeys(subValueKeys, data)
                                    for (var index in sub) {
                                        var kv = sub[index]
                                        if (_this.entityTableInfo[kv.key]) {
                                            var v = _this.getRealValue(kv.key, kv.value, _data)
                                            v = _this.analysisValueByFieldInfo(v, _this.entityTableInfo[kv.key])
                                            if (typeof v != 'string') {
                                                if (v.join) {
                                                    _.each(v.content, function (item) {
                                                        _this.headerInfo.subTitle += item.title + ':' + item.value + '    '
                                                    })
                                                }
                                            } else {
                                                _this.headerInfo.subTitle += _this.entityTableInfo[kv.key].title + ':' + v + '    '
                                            }
                                        }
                                    }
                                }


                                //内容
                                var content = []
                                // var contentTitleKeys = _this.widgetParams.key4Contents ? _this.widgetParams.key4Contents.split(",") : null
                                var contentValueKeys = _this.widgetParams.Valueskey4Contents ? _this.widgetParams.Valueskey4Contents.split(",") : null

                                // if (contentTitleKeys && contentValueKeys) {
                                //     for (var index in contentTitleKeys) {
                                //         var titleKey = contentTitleKeys[index]
                                //         var valueKey = contentValueKeys[index]
                                //         var kv = {}
                                //         kv.titleKey = titleKey
                                //         kv.valueKey = valueKey
                                //         kv[titleKey] = null
                                //         kv[valueKey] = null
                                //         content.push(kv)
                                //     }
                                //     DetailsUtils.findValuesByJSON(content, res.data)
                                //     for (var index in content) {
                                //         var value = content[index]
                                //         var kv = {
                                //             title: value[value.titleKey],
                                //             value: value[value.valueKey] == null ? '' : _this.transformData(value[value.valueKey]),
                                //         }
                                //         _this.content.push(kv)
                                //     }
                                // } else
                                if (contentValueKeys) {
                                    // content = DetailsUtils.findValuesByKeys(contentTitleKeys || contentValueKeys, data)
                                    content = DetailsUtils.findValuesByKeysFromJson((contentValueKeys).concat(), data)
                                    for (var index in content) {
                                        var kv = content[index]
                                        var k = DetailsUtils.getAllJsonKeys(kv)[0]
                                        var v = kv[k]
                                        v = _this.getRealValue(k, v, _data)
                                        if (_this.entityTableInfo[k]) {
                                            v = _this.analysisValueByFieldInfo(v, _this.entityTableInfo[k])
                                            if (typeof v != 'string') {
                                                if (v.join) {
                                                    _.each(v.content, function (item) {
                                                        _this.content.push({
                                                            title: item.title,
                                                            value: item.value,
                                                        })
                                                    })
                                                }
                                            } else {
                                                _this.content.push({
                                                    title: _this.entityTableInfo[k].title,
                                                    value: v,
                                                })
                                            }
                                        }
                                    }
                                    // for (var index in content) {
                                    //     var kv = content[index]
                                    //     var k = DetailsUtils.getAllJsonKeys(kv)[0]
                                    //     var v = kv[k]
                                    //     v = _this.getRealValue(k, v, _data)
                                    //     v = _this.transformData(v)
                                    //     if (_this.analysisValueContent(v) && _this.entityTableInfo[k]) {
                                    //         _this.content.push({
                                    //             title: _this.entityTableInfo[k].title,
                                    //             value: v
                                    //         })
                                    //     }
                                    // }
                                }
                                _this.$forceUpdate()
                            })


                        // console.log('HXB', 'subTitle==', JSON.stringify(res))
                        //标题
                        var title = {
                            key: _this.widgetParams.titleKey
                        }
                        DetailsUtils.findValueFromJSONByDeep(title, data)
                        _this.headerInfo.title = title.value

                        factoryApp.stopLoading(this);//关闭加载圈
                        _this.$forceUpdate()
                    })
                    .then(function (res) {
                    })
            },
            getExpandInfo() {
                var _this = this
                let params = {};
                // console.log('HXB', 'widgetParams==', JSON.stringify(_this.widgetParams))
                var referenceEntityName = _this.widgetParams.ReferenceEntityName || 'forewarningprocessingrecord'
                params.filters = "forewarningEntityId eq " + _this.widgetParams.entityId + " and forewarningId eq " + _this.widgetParams.dataId
                ajax.get(`${_this.metaEntit.project.engine.externalUrl}/${referenceEntityName}`, params).then(res => {//处理结果
                    _this.processResult = res
                    if (!res || !res.data) {
                        return
                    }

                    var data = res.data.length ? res.data[0] : res.data
                    var _data = res.data.length ? res.data[0]._data : res.data._data
                    delete data._data

                    service.getEntityFields(
                        _this.metaEntit.projectId,
                        'forewarningprocessingrecord',
                        null
                    )
                        .then(fieldInfos => {
                            for (var index in fieldInfos) {
                                var fieldInfo = fieldInfos[index]
                                var field = {
                                    title: fieldInfo.title,
                                    inputType: fieldInfo.inputType,
                                    dataType: fieldInfo.dataType,
                                    columnType: fieldInfo.columnType
                                }
                                _this.processResultEntityTableInfo[fieldInfo.name] = field
                            }
                            //处理结果内容
                            var processResultContents = []
                            var contentValueKeys = _this.widgetParams.Valueskey4ProcessResult ? _this.widgetParams.Valueskey4ProcessResult.split(",") : null

                            if (contentValueKeys) {
                                processResultContents = DetailsUtils.findValuesByKeysFromJson((contentValueKeys).concat(), data)
                                for (var index in processResultContents) {
                                    var kv = processResultContents[index]
                                    var k = DetailsUtils.getAllJsonKeys(kv)[0]
                                    var v = kv[k]
                                    v = _this.getRealValue(k, v, _data)
                                    if (_this.processResultEntityTableInfo[k]) {
                                        v = _this.analysisValueByFieldInfo(v, _this.processResultEntityTableInfo[k])
                                        if (typeof v != 'string') {
                                            if (v.join) {
                                                _.each(v.content, function (item) {
                                                    _this.processResultContent.push({
                                                        title: item.title,
                                                        value: item.value,
                                                    })
                                                })
                                            }
                                        } else {
                                            _this.processResultContent.push({
                                                title: _this.processResultEntityTableInfo[k].title,
                                                value: v,
                                            })
                                        }
                                    }
                                }
                            }
                            _this.$forceUpdate()
                        })
                });
            },
            joinValue(value) {
                if (typeof value != 'string') {
                    if (value.join) {
                        _.each(value.content, function (item) {
                            _this.headerInfo.subTitle += item.title + ':' + item.value + '    '
                        })
                    }
                }
            },
            //根据字段信息，解析正确数据
            analysisValueByFieldInfo(value, fieldInfo) {
                var _this = this
                // var field = {
                //     title: fieldInfo.title,
                //     inputType: fieldInfo.inputType,
                //     dataType: fieldInfo.dataType,
                //     columnType: fieldInfo.columnType
                // }

                // if (!fieldInfo.inputType) {
                //     fieldInfo.inputType = ''
                // }
                // if (!fieldInfo.columnType) {
                //     fieldInfo.columnType = ''
                // }
                switch (fieldInfo.inputType) {
                    case 'SingleLineText':
                    case 'MultiLineText':
                    case 'Boolean':
                        return value;
                    case 'PictureUpload':
                        var pics = []
                        for (var index in value) {
                            var item = value[index]
                            item = _this.Config.serverConfig.engineService + '/stream?filePath=' + (item.relativePath || item.url) + '&width=180&height=220'
                            console.log('HXB', "pic====", item)
                            pics.push(item)
                        }
                        return pics
                    case 'DateTime':
                        return this.transformData(value)
                    default:
                        if (fieldInfo.dataType) {
                            switch (fieldInfo.dataType) {
                                case 'map':
                                    //是JSONObj
                                    var arr = []
                                    var res = {
                                        join: true,
                                        content: arr
                                    }
                                    arr.push({
                                        title: value.title,
                                        value: value.value
                                    })
                                    return res
                                case 'array':
                                    //是JSONArr
                                    var arr = []
                                    var res = {
                                        join: true,
                                        content: arr
                                    }
                                    for (var index in value) {
                                        var tValue = value[index]
                                        arr.push({
                                            title: tValue.title,
                                            value: tValue.value
                                        })
                                    }
                                    return res
                                default:
                                    //单条数据
                                    return value
                            }
                        } else {
                            switch (fieldInfo.columnType) {
                                case 'timestamp':
                                    return this.transformData(value)
                                case 'varchar':
                                    return value
                                default:
                                    return value
                            }
                        }
                }
            },
            analysisValueContent(value, fieldInfo) {
                var _this = this
                switch (fieldInfo.type) {
                    case 'PictureUpload':

                        break;
                    case 'SingleLineText':

                        break;
                    case 'DateTime':
                        break
                }
                if (typeof value != 'string') {
                    if (value.length) {
                        for (var index in value) {
                            var tValue = value[index]
                            // if (tValue.title && tValue.value) {
                            _this.content.push({
                                title: tValue.title,
                                value: tValue.value
                            })
                            // }
                        }
                    } else /*if (value.title && value.value)*/ {
                        _this.content.push({
                            title: value.title,
                            value: value.value
                        })
                    }
                    return false
                } else {
                    return true
                }
            },
            transformData(value) {
                if (typeof value == 'number' && (value + '').length != 13) {
                    return value
                }
                var date = new Date(value)
                if (date != 'Invalid Date') {
                    return DetailsUtils.dateFormat('yyyy-MM-dd hh:mm:ss', date)
                } else {
                    return value
                }
            },
            getRealValue(key, value, _data) {
                for (var tKey in _data) {
                    if (tKey == key) {
                        var tData = _data[tKey]
                        for (var tDataKey in tData) {
                            if (tDataKey == value) {
                                return (tData[tDataKey])['title']
                            }
                        }
                    }
                }
                return value
            },
            refresh() {
                //部件刷新的实现
                this.getDetailsInfo();
            },
            getWidgetContext() { //本部件暴露的参数
                let _this = this;
                //return Object.assign({}, this.widgetParams, this.titleInfo);
                return Object.assign({}, {
                    widgetParams: _this.widgetParams,
                    selectedItem: _this.titleInfo,
                    selectedId: _this.widgetParams.dataId,
                    selectedItem: _this.data,
                    metaEntity: _this.metaEntit,
                    metaEntityId: _this.metaEntit.metaEntityId,
                    widgetParams: _this.widgetParams
                })
            },
            handlePreview(file) {
                //预览
                linkapi.openLinkBroswer(file.name ? file.name : "预览", `${config.serverConfig.engineService}/stream?filePath=${file.relativePath || file.url}`);
            }
        },
        component: {},
        filters: {
            timeformat(val) {  //时间格式转换
                return Utils.formatDate(val, "yyyy-MM-dd hh:mm");
            }
        },
        mounted() {
            let _this = this;
            service.init(config.serverConfig.configServerUrl); //初始化请求地址
            service.getMetaEntity(_this.widgetParams.entityId).then(res => {
                _this.metaEntit = res;
                _this.getDetailsInfo();
                _this.getExpandInfo();
            });
            globalEvent.addEventListener("resume", e => {
                this.getDetailsInfo();
            });
        },
        created() {
            factoryApp.init(this);//初始化全局api的指向
        }

    }
</script>
<style lang="css">
    template {
        font-size: 28px;
    }

    ._picture {
        justify-content: center;
        margin-top: 15px;
        margin-right: 20px;
        width: 300px;
    }

    ._picture_img {
        width: 300px;
        height: 400px;
    }

    .details-header {
        /*height: 200px;*/
        padding-left: 25px;
        background-color: #4DA4FE;
        padding-bottom: 20px;
    }

    .wrapper {
        background-color: #FFF;
        border-bottom-color: #ececec;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        position: relative;
    }

    .flex-row {
        flex-direction: row;
    }

    .escape-in {
        color: #FFFFFF;
        font-size: 38px;
        padding-top: 10px;
        padding-bottom: 25px;
    }

    .warn {
        lines: 0;
        font-size: 28px;
        color: #C4E1FE;
        padding-bottom: 2rem;
    }

    .compare-title {
        padding-top: 30px;
        padding-bottom: 30px;
    }

    .text_detail_title {
        font-size: 28px;
        color: #cccccc;
        lines: 1;
        text-overflow: ellipsis;
        text-align: end;
    }

    .text_detail_content {
        font-size: 28px;
        lines: 0;
    }

    .similar {
        font-size: 40px;
        color: crimson;
    }

    .person-title {
        border-bottom-color: #f1f1f1;
        border-bottom-width: 1px;
        border-bottom-style: solid;

        border-top-color: #f1f1f1;
        border-top-width: 1px;
        border-top-style: solid;

        flex-direction: row;
        padding-top: 20px;
        padding-bottom: 20px;
        padding-left: 25px;
        padding-right: 25px;
    }

    .info-detail {
        padding-left: 25px;
        padding-right: 25px;
        padding-top: 20px;
        padding-bottom: 20px;
    }

    .water-mark {
        position: absolute;
        top: 100px;
        left: 50px;
        z-index: -9;
        transform: rotate(-45deg);
    }

    .mark-text {

        color: #666;
        font-size: 45px;
    }

</style>
