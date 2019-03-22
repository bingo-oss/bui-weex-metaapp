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
                <div v-for="(item, index) in content"
                     style="padding-bottom: 18px;">
                    <div class="flex-row"
                         v-if="item.type == 'text'">
                        <div class="content_title">
                            <text class="text_detail_title">{{item.title}}</text>
                        </div>
                        <text class="text_detail_content _500_content">{{item.value}}</text>
                    </div>
                    <div v-else-if="item.type == 'picture'">
                        <div v-if="item.tag =='merge_first'"
                             class="flex-row">
                            <div style="width: 100px; flex: 1;">
                                <text class="text_detail_title">{{item.title}}</text>
                                <image style="height: 380px; padding-right: 25px"
                                       :src="item.value[0].url + item.value[0].sizeConfig"
                                       @click="handlePreview(item.value[0])"
                                ></image>
                            </div>
                            <div style="width: 100px; flex: 1;">
                                <text class="text_detail_title">{{content[index].title}}</text>
                                <image style="height: 380px; padding-right: 25px"
                                       :src="content[index].value[0].url + content[index].value[0].sizeConfig"
                                       @click="handlePreview(content[index].value[0])"
                                ></image>
                            </div>
                        </div>
                        <div v-else-if="item.tag =='merge_second'">
                            <!--<text>{{item}}</text>-->
                        </div>
                        <div v-else>
                            <text class="text_detail_title">{{item.title}}</text>
                            <div class="flex-row">
                                <image style="width:340px; height: 415px; padding-right: 25px; margin-bottom: 16px;"
                                       v-for="pic in item.value"
                                       :src="pic.url + pic.sizeConfig"
                                       @click="handlePreview(pic)"
                                ></image>
                            </div>
                        </div>
                    </div>
                    <div v-else class="flex-row">
                        <div class="content_title">
                            <text class="text_detail_title">{{item.title}}</text>
                        </div>
                        <text class="text_detail_content _500_content">{{item.value}}</text>
                    </div>

                </div>
            </div>
        </div>

        <div style="padding-left: 25px;" v-if="processResultContent && processResultContent.length">
            <div class="compare-title">
                <text style="font-size: 28px;">{{expandInfoTitle}}</text>
            </div>

            <div>
                <div v-for="(item, index) in processResultContent"
                     style="padding-bottom: 18px;">
                    <div class="flex-row"
                         v-if="item.type == 'text'">
                        <div class="content_title">
                            <text class="text_detail_title">{{item.title}}</text>
                        </div>
                        <text class="text_detail_content _500_content">{{item.value}}</text>
                    </div>
                    <div v-else-if="item.type == 'picture'">
                        <!--<div v-if="item.tag =='merge_first'"-->
                             <!--class="flex-row">-->
                            <!--<div style="width: 100px; flex: 1;">-->
                                <!--<text class="text_detail_title">{{item.title}}</text>-->
                                <!--<image style="width: 170px;height: 220px; margin:3px 0px 0px 3px;"-->
                                       <!--:src="item.value[0].url + item.value[0].sizeConfig"-->
                                       <!--@click="handlePreview(item.value[0])"-->
                                <!--&gt;</image>-->
                            <!--</div>-->
                            <!--<div style="width: 100px; flex: 1;">-->
                                <!--<text class="text_detail_title">-->
                                    <!--{{processResultContent[index].title}}-->
                                <!--</text>-->
                                <!--<image style="width: 170px;height: 220px; margin:3px 0px 0px 3px;"-->
                                       <!--:src="processResultContent[index].value[0].url + processResultContent[index].value[0].sizeConfig"-->
                                       <!--@click="handlePreview(processResultContent[index].value[0])"-->
                                <!--&gt;</image>-->
                            <!--</div>-->
                        <!--</div>-->
                        <!--<div v-else-if="item.tag =='merge_second'">-->
                            <!--&lt;!&ndash;<text>{{item}}</text>&ndash;&gt;-->
                        <!--</div>-->
                        <div class="flex-row">
                            <div class="content_title">
                                <text class="text_detail_title">{{item.title}}</text>
                            </div>
                            <div class="flex-row text_detail_content _500_content">
                                <image style="width: 170px;height: 220px; margin:3px 0px 0px 3px;"
                                       v-for="pic in item.value"
                                       :src="pic.url + pic.sizeConfig"
                                       @click="handlePreview(pic)"
                                ></image>
                            </div>
                        </div>
                    </div>
                    <div v-else class="flex-row">
                        <div class="content_title">
                            <text class="text_detail_title">{{item.title}}</text>
                        </div>
                        <text class="text_detail_content _500_content">{{item.value}}</text>
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
                processResultEntityTableInfo: [],//实体表信息（处理结果）
                expandInfoTitle: ''//扩展信息title
            }
        },
        methods: {
            getDetailsInfo() {
                factoryApp.startLoading(this);//显示加载圈
                let _this = this;


                _this.titleInfo = {}
                _this.data = {}
                _this.headerInfo = {}
                _this.content = []
                _this.entityTableInfo = {}
                _this.processResult = {}
                _this.processResultContent = []
                _this.processResultEntityTableInfo = []
                _this.expandInfoTitle = _this.widgetParams.ExpandInfoTitle


                this.content = [];//清除下数据
                ajax.get(`${_this.metaEntit.project.engine.externalUrl}/${metabase.lowerUnderscore(_this.metaEntit.name)}/${_this.widgetParams.dataId}`)
                    .then(res => {
                        _this.data = res
                        console.log('HXB', 'details data==', JSON.stringify(res))
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
                                console.log('HXB', '_this.entityTableInfo==', JSON.stringify(fieldInfos))

                                //副标题
                                var sub = []
                                var subValueKeys = _this.widgetParams.Valueskey4SubTitles ? _this.widgetParams.Valueskey4SubTitles.split(',') : null
                                _this.headerInfo.subTitle = ''
                                if (subValueKeys) {
                                    sub = DetailsUtils.findValuesByKeys(subValueKeys, data)
                                    for (var index in sub) {
                                        var kv = sub[index]
                                        if (_this.entityTableInfo[kv.key]) {
                                            var v = _this.getRealValue(kv.key, kv.value, _data)
                                            v = _this.analysisValueByFieldInfo(v, _this.entityTableInfo[kv.key])
                                            if (typeof v != 'string' && v.join2Content) {
                                                _.each(v.content, function (item) {
                                                    _this.headerInfo.subTitle += item.title + ':' + item.value + '    '
                                                })
                                            } else {
                                                _this.headerInfo.subTitle += _this.entityTableInfo[kv.key].title + ':' + v + '    '
                                            }
                                        }
                                    }
                                }


                                //内容
                                var content = []
                                var contentValueKeys = _this.widgetParams.Valueskey4Contents ? _this.widgetParams.Valueskey4Contents.split(",") : null
                                if (contentValueKeys) {
                                    // 找出指定key的对应键值对，返回数组
                                    content = DetailsUtils.findValuesByKeysFromJson((contentValueKeys).concat(), data)
                                    for (var index in content) {
                                        var kv = content[index]
                                        var k = DetailsUtils.getAllJsonKeys(kv)[0]
                                        var v = kv[k]
                                        //去_data找出映射的真实值
                                        v = _this.getRealValue(k, v, _data)
                                        if (_this.entityTableInfo[k]) {
                                            //根据字段类型解析值
                                            v = _this.analysisValueByFieldInfo(v, _this.entityTableInfo[k])
                                            if (typeof v != 'string' && v.join2Content) {
                                                console.log('HXB', 'v==', JSON.stringify(v))
                                                _.each(v.content, function (item) {
                                                    var newItem = {
                                                        title: item.title,
                                                        value: item.value,
                                                        type: item.type
                                                    }
                                                    newItem = _this.transformDataByType(newItem, item.type)
                                                    _this.content.push(newItem)
                                                })
                                            } else {
                                                _this.content.push({
                                                    title: _this.entityTableInfo[k].title,
                                                    value: v,
                                                    type: v[0] ? v[0].type : v.type
                                                })
                                            }
                                        }
                                    }
                                    _this.setupContentTag(_this.content)
                                    console.log('HXB', '_this.content==', JSON.stringify(_this.content))
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
                var referenceEntityName = _this.widgetParams.ReferenceEntityName
                var associateField4ReferenceEntity = _this.widgetParams.AssociateField4ReferenceEntity
                var AssociateField4Now = _this.widgetParams.AssociateField4Now ? DetailsUtils.traversingJson(_this.widgetParams.AssociateField4Now, _this.data) : null
                if (associateField4ReferenceEntity && AssociateField4Now && referenceEntityName) {
                    params.filters = associateField4ReferenceEntity + ' eq ' + AssociateField4Now
                    ajax.get(`${_this.metaEntit.project.engine.externalUrl}/${referenceEntityName}`, params).then(res => {//处理结果
                        // console.log('HXB', 'getExpandInfo--res', JSON.stringify(res))
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
                                            if (typeof v != 'string' && v.join2Content) {
                                                console.log('HXB', 'v==', JSON.stringify(v))
                                                _.each(v.content, function (item) {
                                                    var newItem = {
                                                        title: item.title,
                                                        value: item.value,
                                                        type: item.type
                                                    }
                                                    newItem = _this.transformDataByType(newItem, item.type)
                                                    _this.processResultContent.push(newItem)
                                                })
                                            } else {
                                                _this.processResultContent.push({
                                                    title: _this.processResultEntityTableInfo[k].title,
                                                    value: v,
                                                    type: v[0] ? v[0].type : v.type
                                                })
                                            }
                                        }
                                    }
                                    _this.setupContentTag(_this.processResultContent)
                                    console.log('HXB', '_this.processResultContent==', JSON.stringify(_this.processResultContent))
                                }
                                _this.$forceUpdate()
                            })
                    });
                }
            },
            getFiltersByKey(keys) {
                var values = []
                _.each(keys, function (key) {
                    var value = DetailsUtils.traversingJson(key, this.data)
                    value = value ? value : DetailsUtils.traversingJson(key, this.widgetParams)
                    values.push(value)
                })
                return values
            },
            joinValue(value) {
                if (typeof value != 'string') {
                    if (value.join2Content) {
                        _.each(value.content, function (item) {
                            _this.headerInfo.subTitle += item.title + ':' + item.value + '    '
                        })
                    }
                }
            },
            //根据字段信息，解析正确数据
            analysisValueByFieldInfo(value, fieldInfo) {
                var _this = this
                switch (fieldInfo.inputType) {
                    case 'SingleLineText':
                    case 'MultiLineText':
                    case 'Boolean':
                        return value;
                    case 'PictureUpload':
                        var pics = []
                        for (var index in value) {
                            var item = value[index]
                            //item.url = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1553158994698&di=22847c957650625069b3114ed6e250e5&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201508%2F22%2F20150822141911_MWarN.png'
                            //item.sizeConfig = ''
                            item.url = _this.Config.serverConfig.engineService + '/stream?filePath=' + (item.relativePath || item.url)
                            item.sizeConfig = '&width=180&height=220'
                            item.type = 'picture'
                            item.title = item.name
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
                                        join2Content: true,
                                        content: arr
                                    }
                                    arr.push({
                                        title: value.title,
                                        value: value.value,
                                        type: value.type
                                    })
                                    return res
                                case 'array':
                                    //是JSONArr
                                    var arr = []
                                    var res = {
                                        join2Content: true,
                                        content: arr
                                    }
                                    for (var index in value) {
                                        var tValue = value[index]
                                        arr.push({
                                            title: tValue.title,
                                            value: tValue.value,
                                            type: tValue.type
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
                return Object.assign({}, {
                    widgetParams: _this.widgetParams,
                    selectedItem: Object.assign({}, _this.data.data),
                    metaEntity: Object.assign({}, _this.metaEntit)
                })
            },
            handlePreview(pic) {
                //预览
                linkapi.openLinkBroswer(pic.name || pic.title || "预览", pic.url);
                // linkapi.openLinkBroswer('预览', 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1553158994698&di=22847c957650625069b3114ed6e250e5&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201508%2F22%2F20150822141911_MWarN.png');
            },
            //给正文内容设置标记
            setupContentTag(content) {
                var _this = this
                for (var index in content) {
                    var item = content[index]
                    var preItem = content[index - 1]
                    switch (item.type) {
                        case 'picture':
                            if (typeof item.value != 'string' && item.value.length == 1) {
                                if (preItem && preItem.tag == 'first') {
                                    item.tag = 'merge_second'
                                    preItem.tag = 'merge_first'
                                } else {
                                    item.tag = 'first'
                                }
                            } else {
                                item.tag = ''
                            }
                            break;
                        default:
                    }
                }
            },
            transformDataByType(data, type) {
                var _this = this
                switch (type) {
                    case 'picture':
                        if (data.value.length) {
                            for (var index in data.value) {
                                var item = data.value[index]
                                //item.url = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1553158994698&di=22847c957650625069b3114ed6e250e5&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201508%2F22%2F20150822141911_MWarN.png'
                                //item.sizeConfig = ''
                                item.url = _this.Config.serverConfig.engineService + '/stream?filePath=' + (item.relativePath || item.url)
                                item.sizeConfig = '&width=180&height=220'
                                item.name = item.fileName || item.name
                            }
                        } else {
                            //data.value.url = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1553158994698&di=22847c957650625069b3114ed6e250e5&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201508%2F22%2F20150822141911_MWarN.png'
                            //data.value.sizeConfig = ''
                            data.value.url = _this.Config.serverConfig.engineService + '/stream?filePath=' + (data.value.relativePath || data.value.url)
                            data.value.sizeConfig = '&width=180&height=220'
                            data.value.name = data.value.fileName || data.value.name
                        }
                        break;
                    default:
                }
                return data
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
                // _this.getExpandInfo();
            });
            globalEvent.addEventListener("resume", e => {
                this.getDetailsInfo();
            });
        },
        created() {
            factoryApp.init(this);//初始化全局api的指向
        },
        watch: {
            data: {
                handler: function () {
                    this.getExpandInfo();
                }
            }
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
        flex-wrap: wrap;
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

    ._500_content {
        width: 500px;
    }

    .content_title {
        width: 150px;
        margin-right: 20px;
    }

</style>
