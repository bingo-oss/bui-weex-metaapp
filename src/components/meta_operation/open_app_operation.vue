<template>
<div @click="openApp">
    <slot>
        <meta-opt-btn :operation="operation"></meta-opt-btn>
    </slot>
</div>
</template>
<script>
const linkapi = require('linkapi');
var pathToRegexp = require('path-to-regexp');
export default {
    props:{
        widgetContext:{//由使用操作的部件传入的部件上下文
            type:Object,
            required:true
        },
        operation:{//操作的定义，必传参数
            type:Object,
            required:true
        }
    },
    data(){
        return {

        };
    },
    methods:{
        openApp(){
            var app=this.operation.app;
            var appCode=app.appCode;
            var appUrl=app.appUrl;
            var appData=app.appData;
            var appParams=this.operation.appParams;
            if(appUrl){
                appUrl=pathToRegexp.compile(appUrl)(appParams);
            }
            if(appData){
                appData=pathToRegexp.compile(appData)(appParams);
            }
            let params = {
                appCode: appCode,
                appUrl: appUrl,
                data: appData
            };
            linkapi.runApp(params);
        }
    }
}
</script>