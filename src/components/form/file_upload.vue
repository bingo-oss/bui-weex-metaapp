<template lang="html">
    <div v-if="showComponent" class="" :style="{'background-color':(validatorErrorBag?'#FAA':'')}">
        <template v-if="viewMode||forceView">
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
            </div>
        </template>
        <div class="form-hrb">
            <div v-if="!viewMode&&!forceView" class="file_image">
                <bui-button class="ex-btn" size="small" value="文件上传" @click="inputClicked(2)"></bui-button>
            </div>
            <div class="file_li" v-for="(file,index) in files" @click="handlePreview(file)">
                <text  @click="handlePreview(file)" width="120px" height="120px" style="font-size: 28px;">{{file.name}}</text>
                <bui-icon @click="del(file,index)" class="image_del" name="ion-android-delete" size="40" color="red"></bui-icon>
            </div>
        </div>
        <div class="wxc-loading" v-if="loadingText">
            <div class="loading-box">
                <text
                        class="loading-text">上传中...
                </text>
            </div>
        </div>
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
    import {StorageClient,ConvertClient} from "../../js/ufs/ufs";

    var modal = weex.requireModule('modal');
    export default {
        componentType: 'FileUpload',
        extends: mixin,
        watch:{
            value(newVal){
                if(newVal){
                    this.files =  newVal
                }
            }
        },
        data() {
            return {
                valueText: '',
                files:[],
                loadingText:false,
                storageClient:"",//ufs--对象
                ufsUrl:""//ufs-路径
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
            fileUpload(files,filesIndex){
                let _this = this;
                if(!files[filesIndex]) {
                    _this.$emit('input', _this.files)
                    _this.loadingText = false;
                    return false;
                }
                _this.loadingText = true;
                //执行上传文件
                let _file = files[filesIndex];
                _this.storageClient.upload({
                    file:_file.resourceLocal
                },{baseUrl:_this.ufsUrl}).then((data,resp)=>{
                    _this.files.push({
                        id:data.id,
                        name:_file.resourceDescription,
                        size:_file.resourceSize
                    });
                    filesIndex++;
                    _this.fileUpload(files,filesIndex);
                });
            },
            inputClicked(type) {
                let _this = this;
                linkapi.selectFiles(type, (result) => {
                    if (result.resource) {
                        if(_.isString(result.resource)){
                            result.resource = JSON.parse(result.resource)
                         }
                        _this.fileUpload(result.resource,0);//执行上传
                    }
                }, (err) => {});
            },
            handlePreview(file) {
                //下载并打开
                if(file.savePath){
                    //已经下载过
                    FileModule.openFile(file.savePath);
                    return false;
                }
                this.storageClient.urlFor({
                    fileId: file.id
                }).then(res => {
                    FileTransfer.download(`${this.ufsUrl}/${res.url}`,{filename:file.name},function(res){
                     },function(res){
                        file.savePath = res.savePath;//记录下载后的路径--再次打开不需要重新下载
                        FileModule.openFile(res.savePath);
                     },function(erro){
                     });
                });
            },
            del(file,index){
                //移除文件
                this.files.splice(index,1);
                this.$emit('input', this.files);
            }
        },
        mounted(){
            let _this = this;
            //设置ufs图片读取
            let contextPath = this.$getContextPath();
            config.readRuntimeConfig(contextPath).catch(err => {}).then(runtimeConfig => {
                _this.ufsUrl = runtimeConfig.ufsUrl
                if(config.debug){
                    //调试模式
                    _this.storageClient = new StorageClient(_this.ufsUrl,{
                        accessToken:config.token
                    });
                }else{
                    linkapi.getToken(obj => {
                        _this.storageClient = new StorageClient(_this.ufsUrl,{
                            accessToken:obj.accessToken
                        });
                    });
                }
            });//获取以及设置ufs对象
        }
    }
</script>

<style src="../../styles/common.css" scoped="false"></style>
<style>
    .file_image{ margin-bottom: 15px; margin-left: 15px; }
    .file_li{ padding-bottom: 5px; padding-top: 5px; min-height: 50px;}
    .image_del{ position: absolute; right: 5px; bottom:5px;}
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