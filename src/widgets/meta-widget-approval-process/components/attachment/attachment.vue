<template>
    <div>
        <div v-for="(fileList,index) in defaultFileList" @click="handlePreview(fileList)" class="label-wrapper file_d" style="align-items: center;" v-if="more||(!more&&index<3)">
            <bui-image class="file_img" width="80px" height="80px" :src="suffixImg(fileList)"></bui-image>
            <div class="file_info">
                <text class="file_title">{{fileList.name}}</text>
                <text class="file_size">{{humanFileSize(fileList.size)}}</text>
            </div>
        </div>
        <text class="more" v-if="defaultFileList.length>3" @click="moreShow">{{more?"收起":"查看更多"}}</text>
    </div>
</template>
<script>
    import _ from '../../../../js/tool/lodash'
    import config from '../../../../js/config';
    import linkapi from "linkapi";
    import buiweex from "bui-weex";
    export default {
        props: {
            uploadAction: { //上传地址
                type: String,
                default: ""
            },
            value: {
                type: Array,
                default: () => []
            },
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
                officeSupport: ["ods","xls","xlsb","xlsm","xlsx","one","onetoc2","onepkg","odp","pot","potm","potx","pps","ppsm","ppsx","ppsx","ppt","pptm","pptx","doc","docm","docx","dot","dotm","dotx","odt","pdf"],
                oldFileList: []
            }
        },
        computed: {
            isPc() {
                return linkplugin.isInPc;
            },
            defaultFileList() {
                let _t = this;
                if (!_.isEmpty(_t.value)) {
                    return new Array().concat(_t.value);
                }
                return [];
            },
            headers() {
                let token = mVueToolkit.session.getToken();
                return {
                    Authorization: "Bearer " + token,
                    version: "3.6.0"
                };
            }
        },
        mounted () {},
        methods: {
            suffixImg(file){
                let fileSuffix = file.name.split('.');
                if(fileSuffix&&fileSuffix.length) {
                    fileSuffix = fileSuffix[1];
                    var flag = 1,imgSrc = "../../../images/doc/unknown@2x.png",imgIcon = ["acc@2x.png", "avi@2x.png", "bmp@2x.png", "css@2x.png", "doc@2x.png", "docx@2x.png", "dwg@2x.png", "eml@2x.png", "eps@2x.png", "file@2x.png", "fla@2x.png", "gif@2x.png", "html@2x.png", "htm@2x.png", "ind@2x.png", "ini@2x.png", "jpeg@2x.png", "jpg@2x.png", "jsf@2x.png", "mdb@2x.png", "mid@2x.png", "mkv@2x.png", "mov@2x.png", "mp3@2x.png", "mp4@2x.png", "mpeg@2x.png", "pdf@2x.png", "png@2x.png", "ppt@2x.png", "pptx@2x.png", "proj@2x.png", "ps@2x.png", "pst@2x.png", "pub@2x.png", "rar@2x.png", "rtf@2x.png", "svg@2x.png", "swf@2x.png", "tif@2x.png", "txt@2x.png", "url@2x.png", "vsd@2x.png", "wav@2x.png", "wma@2x.png", "wmp@2x.png", "xls@2x.png", "xlsx@2x.png", "zip@2x.png"];
                    _.each(imgIcon,function(icon,index){
                        if (icon.split("@")[0] == fileSuffix.toLowerCase()) {
                            flag = 0;
                            imgSrc = icon.split("@")[0]+"_2x.png";
                        }
                    });
                    //默认读取我们专业模块的图片包
                    return  "https://www.bingolink.biz/web/images/document/"+imgSrc;
                }
                //return imgSrc;
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
                    suffix = suffix[suffix.length - 1].toLowerCase();
                    if (this.officeSupport.indexOf(suffix) != -1) {
                        previewUrl = this.officeViewUrl + encodeURIComponent(downloadUrl);
                    } else {
                        previewUrl = downloadUrl;
                    }
                    linkapi.openLinkBroswer("预览",previewUrl);
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
                    linkapi.openLinkBroswer("预览",previewUrl);
                });
            },
            moreShow(){
                this.more = !this.more;
            }
        }
    }
</script>
<style src="../../../../styles/common.css"></style>
<style>
    .file_d{ background-color: #F2F2F2; padding: 20px; margin-bottom: 10px;}
    .file_img{ margin-right: 20px;}
    .file_info{ font-size: 30px; width: 750px;}
    .file_title{ font-size: 30px; lines :1; width: 550px; text-overflow:ellipsis;}
    .file_size{ font-size: 28px; color: #808080; margin-top: 8px;  lines :1; width: 550px; text-overflow:ellipsis;}
    .mb10{ margin-bottom: 15px;}
    .more{ text-align: center; padding-top: 30px; padding-bottom: 20px; font-size: 30px; color: #AEAEAE;}
</style>