<template>
    <div>
        <div v-for="(fileList,index) in defaultFileList" @click="handlePreview(fileList)" class="label-wrapper file_d" style="align-items: center;" v-if="more||(!more&&index<3)">
            <bui-image class="file_img" width="80px" height="80px" :src="getFiletype(fileList.name)"></bui-image>
            <div class="file_info">
                <text class="file_title">{{fileList.name}}</text>
                <text class="file_size">{{humanFileSize(fileList.size)}}</text>
            </div>
        </div>
        <text class="more" v-if="defaultFileList.length>3" @click="moreShow">{{more?"收起":"查看更多"}}</text>
    </div>
</template>
<script>
    import _ from '../../js/tool/lodash'
    import config from '../../js/config';
    import linkapi from "linkapi";
    import buiweex from "bui-weex";
    import service from "./js/service";
    const fileTransfer = weex.requireModule('FileTransferModule');
    const FileModule = weex.requireModule('FileModule');

    export default {
        props: {
            widgetParams: {
                // 表单组件的定义
                type: Object,
                required: true
            },
            uploadAction: { //上传地址
                type: String,
                default: ""
            },
            /*value: {
             type: Array,
             default: () => []
             },*/
            multiple: { //是否支持多选文件同时上传
                type: Boolean,
                default: true
            },
            supportFormat: { //支持的后缀
                type: Array,
                default:  () => []
        },
        maxSize: { //单个文件最大储存大小，单位为KB
            type: Number
        },
        isForceView: { //是否查看模式 (查看表单或无权限编辑时为true)
            type: Boolean,
            default: false
        },
        label: { //字段名
            type: String,
            default:'附件'
        }
    },
    data() {
        var officeUrl = "https://officeonline.bingosoft.net";
        return {
            more:false,
            officeViewUrl: `${officeUrl}/op/view.aspx?src=`,  //预览office文件地址前缀
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
            ],
            oldFileList: [],
            defaultFileList:[]
        }
    },
    computed: {
        isPc() {
            return linkplugin.isInPc;
        },
        /*            defaultFileList() {
         let _t = this;
         if (!_.isEmpty(_t.value)) {
         return new Array().concat(_t.value);
         }
         return [];
         },*/
        headers() {
            let token = mVueToolkit.session.getToken();
            return {
                Authorization: "Bearer " + token,
                version: "3.6.0"
            };
        }
    },
    mounted () {
        if(!this.widgetParams.dataId){return}
        service.getAttachment(null,this.widgetParams.dataId).then((res)=> {
            //获取对应任务下的正文
            let _attachment = [];
            _.each(res.data,(item, index)=>{
                if(item.attachmentType == 1)
                {
                    _attachment = [item];
                }
            })
            this.defaultFileList = _attachment;
        });
    },
    methods: {
        getFiletype(fileName) {
            let suffix = fileName.split(".");
            if (suffix.length > 1) {
                suffix = suffix[suffix.length - 1].toLowerCase();
            } else {
                suffix = "";
            }
            var supportSuffix = [
                "doc", "docx", "jpg", "jpeg", "png", "gif", "bmp", "key", "mp3", "wma", "ogg", "wav", "flac",
                "ape", "mp4", "wmv", "ogv", "avi", "flv", "mov", "mpeg", "rmvb", "pdf", "ppt", "pptx", "rar",
                "zip", "7z", "bz", "tgz", "tar", "gz", "txt", "conf", "vsd", "vsm", "vsdx", "xls", "xlsx"
            ];
            if (supportSuffix.indexOf(suffix) != -1) {
                let _icon = suffix
                if(["png","jpeg","jpg","gif","bmp"].indexOf(suffix)!=-1){
                    _icon = "jpg"
                }else if(["doc","docx"].indexOf(suffix)!=-1){
                    _icon = "doc"
                }else if(["mp3","wma","ogg","wav","flac","ape"].indexOf(suffix)!=-1){
                    _icon = "mp3"
                }else if(["mp4","wmv","ogv","avi","flv","mov","mpeg","rmvb"].indexOf(suffix)!=-1){
                    _icon = "mp4"
                }else if(["ppt","pptx"].indexOf(suffix)!=-1){
                    _icon = "ppt"
                }else if(["rar","zip","7z","bz","tgz","tar","gz"].indexOf(suffix)!=-1){
                    _icon = "rar"
                }else if(["txt","conf"].indexOf(suffix)!=-1){
                    _icon = "txt"
                }else if(["vsd","vsm","vsdx"].indexOf(suffix)!=-1){
                    _icon = "vsd"
                }else if(["xls","xlsx"].indexOf(suffix)!=-1){
                    _icon = "xls"
                }
                return "/image/filetypes/" + _icon +".png";
            } else {
                return "/image/filetypes/other.png";
            }
        },
        emitValue() {
            let _uploadList=[];
            _.each(this.$refs.upload.fileList,function(uploadFile){
                _uploadList.push({
                    id: uploadFile.id || null,
                    name: uploadFile.name,
                    downloadUrl:  uploadFile.downloadUrl,
                    size: uploadFile.size
                });
            });
            this.$emit("input", _uploadList);
        },
        humanFileSize(fileSize){
            //文件大小转换
            if(typeof fileSize=="string"){
                return fileSize;
            }
            if(Math.floor(fileSize/1024/1024/1024)>0){
                return (fileSize/1024/1024/1024).toFixed(2)+"GB";
            }else if(Math.floor(fileSize/1024/1024)>0){
                return (fileSize/1024/1024).toFixed(2)+"MB";
            }else{
                return (fileSize/1024).toFixed(2)+"KB";
            }
        },
        downloadUrl(url,success) {
            if (_.startsWith(url, 'http://') || _.startsWith(url, 'https://')) {
                /*return url;*/
                success(url)
            }else if(this.uploadAction){
                success(`${this.uploadAction}?filePath=${url}`)
            }else{
                config.getStreamUrl().then((res)=>{
                    success(`${res}?filePath=${url}`)
            })
            }
            //return `${this.uploadAction}?filePath=${url}`;
        },
        handleBeforeUpload() {
            let ok = true,_this =this;
            this.oldFileList = _.cloneDeep(this.$refs.upload.fileList);
            return new Promise((resolve, reject) => {
                        if(ok){
                            _this.$nextTick(function() {
                                resolve();
                            });
                        }else{
                            reject();
        }
        });
        },
        handleSuccess(res, file) {
            file.downloadUrl =  res.file.relativePath;
            this.emitValue();
        },
        handleError(error, file) {
            console.log(error);
            console.log(file);
            iview$Message.info("上传失败，请联系管理员");
        },
        handleRemove (file) {
            let fileList = this.$refs.upload.fileList;
            this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
            this.emitValue();
        },
        handleExceededSize(file, fileList) {
            this.$refs.upload.fileList=_.cloneDeep(this.oldFileList);
            this.fileList = this.$refs.upload.fileList;
            iview$Message.info(`大小超过限制,最大${this.maxSize}KB`);
        },
        handleFormatError(file, fileList) {
            this.$refs.upload.fileList=_.cloneDeep(this.oldFileList);
            this.fileList = this.$refs.upload.fileList;
            iview$Message.info(`格式错误,支持${this.supportFormat.join(",")}等文件格式`);
        },
        handlePreview(file) {
            this.downloadUrl(file.downloadUrl,(downloadUrl)=>{
                let suffix = file.name.split("."),previewUrl;
            if(file.download){
                previewUrl = downloadUrl;
                //执行的是下载操作--不是预览
                fileTransfer.download(previewUrl,{filename:file.name},function(res){
                    /*buiweex.alert(res);*/
                },function(res){
                    FileModule.openFile(res.savePath);
                    /*buiweex.alert(res);*/
                },function(erro){
                    buiweex.alert(erro);
                });
            }else{
                suffix = suffix[suffix.length - 1].toLowerCase();
                if (this.officeSupport.indexOf(suffix) != -1) {
                    previewUrl = this.officeViewUrl + encodeURIComponent(downloadUrl);
                } else {
                    previewUrl = downloadUrl;
                }
                linkapi.openLinkBroswer(file.name?file.name:"预览",previewUrl);
            }
        });
        },
        handleEdit(file) {
            //TODO: 调用PC控件编辑文件
            console.log('edit');
        },
        handleDownload(file) {
            /*let downloadUrl = this.downloadUrl(file.downloadUrl);
             window.open(downloadUrl, "_blank");*/
            this.downloadUrl(file.downloadUrl,(downloadUrl)=>{
                linkapi.openLinkBroswer(file.name?file.name:"预览",previewUrl);
        });
        },
        moreShow(){
            this.more = !this.more;
        }
    }
    }
</script>
<style src="../../styles/common.css"></style>
<style>
    .file_d{ background-color: #F2F2F2; padding: 20px; margin-bottom: 10px;}
    .file_img{ margin-right: 20px;}
    .file_info{ font-size: 30px; width: 750px;}
    .file_title{ font-size: 30px; lines :1; width: 550px; text-overflow:ellipsis;}
    .file_size{ font-size: 28px; color: #808080; margin-top: 8px;  lines :1; width: 550px; text-overflow:ellipsis;}
    .mb10{ margin-bottom: 15px;}
    .more{ text-align: center; padding-top: 30px; padding-bottom: 20px; font-size: 30px; color: #AEAEAE;}
</style>