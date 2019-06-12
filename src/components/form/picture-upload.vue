<template lang="html">
    <div v-if="showComponent" class="" :style="{'background-color':(validatorErrorBag?'#FAA':'')}">
        <template v-if="viewMode||forceView">
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                    <!--
                                        <text class="view-text" :value="valueText"></text>
                    -->
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
                <!--<text class="form-input" :style="inputStyle" @click="inputClicked">{{valueText || '选择图片...'}}</text>-->
            </div>
        </template>
        <div class="form-hrb" style="flex-direction:row;flex-wrap:wrap;">
            <div class="file_image" v-for="(file,index) in files" @click="handlePreview(file)">
                <bui-image @click="handlePreview(file)" width="120px" height="120px"
                           v-if="getImageUrl(file)&&file.url"
                           :src="file.url"></bui-image>
                <bui-icon @click="del(file,index)" class="image_del" name="ion-android-delete"
                          size="40" color="red"></bui-icon>
            </div>
            <div v-if="!viewMode&&!forceView" class="file_image"
                 @click="showOptionBar = !showOptionBar">
                <bui-image width="120px" height="120px" src="/image/u85.png"
                           @click="showOptionBar = !showOptionBar">>
                </bui-image>
            </div>
        </div>
        <div class="wxc-loading" v-if="loadingText">
            <div class="loading-box">
                <text
                        class="loading-text">上传中...
                </text>
            </div>
        </div>
        <bui-actionsheet
                :items="optionItems"
                v-model="showOptionBar"
                title="请选择操作类型"
                @itemClick="onSelectOptionType"
                ref="optionActionSheet"></bui-actionsheet>

    </div>
</template>

<script>
    import mixin from './component-mixin.js'

    const linkapi = require("linkapi");
    const FileModule = weex.requireModule('FileModule');
    const FileTransfer = weex.requireModule('FileTransferModule');
    import config from '../../js/config';
    import _ from '../../js/tool/lodash.js';
    import buiweex from "bui-weex";
    import {StorageClient, ConvertClient} from "../../js/ufs/ufs.js";


    var modal = weex.requireModule('modal');
    export default {
        componentType: 'PictureUpload',
        extends: mixin,
        watch: {
            value(newVal) {
                if (newVal) {
                    this.files = newVal;
                }
            }
        },
        data() {
            return {
                valueText: '',
                files: [],
                optionItems: ["拍照上传", "选择图片"],
                showOptionBar: false,
                loadingText: false,
                ufsUrl: "",
                storageClient: null
            }
        },
        computed: {
            inputStyle() {
                return {
                    color: this.value ? '' : '#BEBCBC'
                }
            }
        },
        methods: {
            onSelectOptionType(item) {
                switch (item) {
                    case '拍照上传':
                        this.inputClicked(0);
                        break;
                    case '选择图片':
                        this.inputClicked(1);
                        break;
                }
                this.showOptionBar = false;
            },
            fileUpload(files, filesIndex) {
                let _this = this;
                if (!files[filesIndex]) {
                    _this.$emit('input', _this.files)
                    _this.loadingText = false;
                    return false;
                }
                var _file = files[filesIndex]

                let _sourcePath = {
                    sourcePath: _file.resourceLocal,
                    savePath: true,
                    quality: 70
                }

                if (_file.resourceSize && (_file.resourceSize.indexOf("KB") == -1)) {
                    _sourcePath.targetWidth = 640;
                }//需要压缩
                _this.loadingText = true;
                linkapi.compressImage(_sourcePath, function (file) {
                    if (file && file.status == 'success') {
                        //执行上传文件
                        _this.storageClient.upload(
                                {file: file.filePaths[0]},
                                {baseUrl: _this.ufsUrl})
                                .then((data, resp) => {
                            _this.storageClient.urlFor({
                                fileId: data.id,
                                responseHeaderOverrides:{
                                    "Content-Disposition":`attachment; ${_file.resourceDescription}`
                                }
                            }).then(res => {
                                _this.files.push({
                                id: data.id,
                                name: _file.resourceDescription,
                                size: _file.resourceSize,
                                url:`${_this.ufsUrl}/${res.url}`
                            });
                            filesIndex++;
                            _this.fileUpload(files, filesIndex);
                        });
                    }).catch((resp) => {
                        });
                    } else if (!file) {
                        loadingText = false;
                        buiweex.alert("压缩失败");
                    } else {
                        loadingText = false;
                        buiweex.alert(file.message);
                    }
                });
            },
            /**
             * 点击拍照/选本地图片
             **/
            inputClicked(type) {
                if (this.readonly) {
                    return;
                }
                let _this = this;
                linkapi.selectFiles(type, (result) => {
                    if (result) {
                        if (result.resource) {
                            if (_.isString(result.resource)) {
                                result.resource = JSON.parse(result.resource)
                            }
                            _this.fileUpload(result.resource, 0);//执行上传
                        }
                    }
                }, (err) => {
                })
            },
            getImageUrl(file) {
                if(!file.url){
                    this.storageClient.urlFor({
                        fileId: file.id
                    }).then(res => {
                        file.url = `${this.ufsUrl}/${res.url}`;
                    this.$forceUpdate();
                });
                }
                return true;
            },
            handlePreview(file) {
                var _this = this
                //下载并打开
                if (file.savePath) {
                    //已经下载过
                    FileModule.openFile(file.savePath);
                    return false;
                }
                _this.storageClient.urlFor({
                    fileId: file.id
                }).then(res => {
                    // buiweex.alert(`${_this.ufsUrl}/${res.url}` + "\r\n-----------\r\n" + JSON.stringify({filename: file.name}))
                    file.url = `${_this.ufsUrl}/${res.url}`
                FileTransfer.download(`${_this.ufsUrl}/${res.url}`, {filename: file.name}, function (res) {
                }, function (res) {
                    file.savePath = res.savePath;//记录下载后的路径--再次打开不需要重新下载
                    FileModule.openFile(res.savePath);
                }, function (erro) {
                });
            });
            },
            del(file, index) {
                //移除图片
                this.files.splice(index, 1);
                this.$emit('input', this.files)
            }
        },
        mounted() {
            //设置ufs图片读取
            let contextPath = this.$getContextPath(), _t = this;
            config.readRuntimeConfig(contextPath)
                    .catch(err => {
            })
        .then(runtimeConfig => {
                _t.ufsUrl = runtimeConfig.ufsUrl;
            if (config.debug) {
                //调试模式
                _t.storageClient = new StorageClient(_t.ufsUrl, {
                    accessToken: config.token
                });
            } else {
                linkapi.getToken(obj => {
                    _t.storageClient = new StorageClient(_t.ufsUrl, {
                    accessToken: obj.accessToken
                });
            });
            }
        });//获取以及设置ufs对象
        }
    }
</script>

<style src="../../styles/common.css" scoped="false"></style>
<style>
    .file_image {
        margin-bottom: 15px;
        margin-left: 15px;
    }

    .image_del {
        position: absolute;
        right: 5px;
        bottom: 5px;
    }

    .wxc-loading {
        position: fixed;
        left: 287px;
        top: 520px;
        z-index: 9999;
        align-items: center;
        justify-content: center;
    }

    .loading-box {
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        width: 175px;
        height: 80px;
        background-color: #000;
        opacity: .4;
    }

    .loading-text {
        padding-top: 30px;
        color: #fff;
        font-size: 30px;
    }
</style>
