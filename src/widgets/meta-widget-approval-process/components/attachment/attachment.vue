<template>
    <div>
        <div v-for="fileList in defaultFileList" @click="handlePreview(fileList)" class="label-wrapper" style="align-items: center; height: 120px;">
            <!--<bui-image class="file_img" width="120px" height="120px" src="https://img.alicdn.com/tps/TB1z.55OFXXXXcLXXXXXXXXXXXX-560-560.jpg"></bui-image>-->
            <text style="font-size: 30px; width: 750px;">{{fileList.name}}</text>
        </div>
    </div>
</template>
<script>
    import _ from '../../../../js/tool/lodash'
    import config from '../../../../js/config';
    import linkapi from "linkapi";
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
            humanFileSize(fileSize) {
                fileSize = Number(fileSize||0);
                return filesize(fileSize).human('jedec');//si,jedec
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
                })
            }
        }
    }
</script>
<style src="../../../../styles/common.css"></style>
<style>
    .file_img{ margin-right: 20px;}
    .mb10{ margin-bottom: 15px;}
</style>