<template>
<!--
    <text>123123123</text>
-->
    <div>
        <bui-image width="38px" height="38px" :src="getImageUrl(operation.icon)"></bui-image>
    </div>
</template>
<script>
    import Util from '../../../js/utils';
    import Config from '../../../js/config'

    export default {
        props:{
            operation:{
                type:Object
            }
        },
        data(){
            return {
                icon:""
            }
        },
        methods:{
            getImageUrl(url){
                let _url = Config.serverConfig.engineService + "/stream?filePath=";
                if (Util.isEmpty(url)) {
                    return "";
                }
                let _array = url.split("||");
                if (Array.isArray(_array)) {
                    if (_array.length > 0) {
                        return _url + _array[0];
                    } else {
                        return _url + url;
                    }
                } else {
                    return _url + url;
                }
            }
        },
        watch:{
            "operation"(val){
                if(val.icon){
                    this.icon = val.icon;
                }
            }
        }
    }
</script>

