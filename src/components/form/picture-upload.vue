<template lang="html">
    <div v-if="showComponent" class="">
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
                <bui-image  @click="handlePreview(file)" width="120px" height="120px" :src="getImageUrl(file.relativePath)"></bui-image>
                <bui-icon @click="del(file,index)" class="image_del" name="ion-android-delete" size="40" color="red"></bui-icon>
            </div>
            <div v-if="!viewMode&&!forceView" class="file_image" @click="inputClicked">
                <bui-image width="120px" height="120px" src="/image/u85.png" @click="inputClicked">></bui-image>
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

export default {
    componentType: 'PictureUpload',
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
            officeSupport: [
                "ods",
                "xls",
                "xlsb",
                "xlsm",
                "xlsx",
                "one",
                "onetoc2",
                "onepkg",
                "odp",
                "pot",
                "potm",
                "potx",
                "pps",
                "ppsm",
                "ppsx",
                "ppsx",
                "ppt",
                "pptm",
                "pptx",
                "doc",
                "docm",
                "docx",
                "dot",
                "dotm",
                "dotx",
                "odt",
                "pdf"
            ]
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
                return false;
            }
            FileTransfer.upload(files[filesIndex].resourceLocal,config.serverConfig.engineService + "/stream",{},(progress)=>{
                //进度
            },(res)=>{
                if(res.code==200){
                    var fileData = JSON.parse(res.response)
                    _this.files.push(fileData.file);
                    filesIndex++;
                    _this.fileUpload(files,filesIndex)
                    //_this.$emit('input', JSON.stringify(_this.files))
                }
                //this.$alert(res);
                //成功回调
            },(erro)=>{
                //失败回调
                _this.$alert(erro);
                filesIndex++;
                _this.fileUpload(files,filesIndex)
            });
        },
        inputClicked(e) {
            if(this.readonly){
                return;
            }
            let _this = this;
            linkapi.selectFiles(1, (result) => {
                 if (result.resource) {
                        if(_.isString(result.resource)){
                            result.resource = JSON.parse(result.resource)
                        }
                        _this.fileUpload(result.resource,0);//执行上传
/*                     linkapi.uploadFiles(result.resource, (res) => {
                         this.$alert(res);
                     }, (err) => {
                         //this.$alert(err);
                     })*/
                 } else {
                 // No resource selected.
                 }
                 // this.$emit('input', result.id)
                 // this.valueText = result.name;
             }, (err) => {
                 //this.$alert(err);
             })

            /*FileTransfer.upload("","",{},(e)=>{
                this.$alert(e);
            },(e)=>{
                this.$alert(e);
            },(erro)=>{
                this.$alert(erro);
            })*/
            /*linkapi.selectFiles(1, (result) => {
                /!*if (result.resource) {
                    linkapi.uploadFiles(result.resource, (res) => {
                        this.$alert(res);
                    }, (err) => {
                        //this.$alert(err);
                    })
                } else {
                    // No resource selected.
                }*!/
                this.$alert(result)
                // this.$emit('input', result.id)
                // this.valueText = result.name;
            }, (err) => {
                this.$alert(err);
            })*/
        },
        getImageUrl(url){
            let _url = config.serverConfig.engineService + "/stream?filePath=";
            if (_.isEmpty(url)) {
                return "";
            }
            let _array = url.split("||");
            if (Array.isArray(_array)) {
                if (_array.length > 0) {
                    return _url + _array[0];
                } else {
                    this.$alert(_url)
                    return _url + url;
                }
            } else {
                this.$alert(_url)
                return _url + url;
            }
        },
        downloadUrl(url,success) {
            if (_.startsWith(url, 'http://') || _.startsWith(url, 'https://')) {
                success(url)
            }else{
                success(`${config.serverConfig.engineService}/stream?filePath=${url}`)
            }
        },
        handlePreview(file) {
            //下载或者预览
            this.downloadUrl(file.relativePath,(downloadUrl)=>{
                let suffix = file.fileName.split("."),previewUrl;
                if(file.download){
                    previewUrl = downloadUrl;
                    //执行的是下载操作--不是预览
                    FileTransfer.download(previewUrl,{filename:file.fileName},function(res){
                        /*buiweex.alert(res);*/
                    },function(res){
                        FileModule.openFile(res.savePath);
                        /*buiweex.alert(res);*/
                    },function(erro){

                    });
                }else{
                    if (this.officeSupport.indexOf(suffix) != -1) {
                        previewUrl = `https://officeonline.bingosoft.net/op/view.aspx?src=${encodeURIComponent(downloadUrl)}`;
                    } else {
                        previewUrl = downloadUrl;
                    }
                    linkapi.openLinkBroswer(file.name?file.name:"预览",previewUrl);
                }
            });
        },
        del(file,index){
            //移除图片
            this.files.splice(index,1);
            this.$emit('input', this.files)
        }
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>
<style>
    .file_image{ margin-bottom: 15px; margin-left: 15px;}
    .image_del{ position: absolute; right: 5px; bottom:5px;}
</style>