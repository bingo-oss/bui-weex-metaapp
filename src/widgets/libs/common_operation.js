
//启动流程
function startProcess() {
    return {
        onclick:function(ctx,$optInst){
            var spPromise=ctx.processLauncher.startProcess();
            //完成后按钮可再次点击
            spPromise.then(
                ()=>{
                    $optInst.mustStopRepeatedClick = false;
                },
                ()=>{
                    $optInst.mustStopRepeatedClick = false;
                }
            );
        }
    }
}
//审批流程
function approveProcess() {
    return {
        onclick:function(ctx,$optInst){
            var spPromise=ctx.processLauncher.approveProcess();
            //完成后按钮可再次点击
            spPromise.then(()=>{
                $optInst.mustStopRepeatedClick = false;
            },()=>{
                $optInst.mustStopRepeatedClick = false;
            });
        }
    }
}
//驳回流程
function dismissProcess(){
    return {
        onclick:function (ctx,$optInst){
            var spPromise=ctx.processLauncher.dismissProcess();
            //完成后按钮可再次点击
            spPromise.then(()=>{
                $optInst.mustStopRepeatedClick = false;
            },()=>{
                $optInst.mustStopRepeatedClick = false;
            });
        }
    }
}
//打印
/*function print(){
    return {
        onclick:function (ctx,$optInst){
            var spPromise=ctx.processLauncher.print();
            //完成后按钮可再次点击
            $optInst.mustStopRepeatedClick = false;
        }
    }
}*/

function processFormSave(){
    //流程表单保存
    return {
        onclick:function (ctx,$optInst){
            var spPromise=ctx.processLauncher.processFormSave();
            //完成后按钮可再次点击
            spPromise.then(()=>{
                $optInst.mustStopRepeatedClick = false;
            },()=>{
                $optInst.mustStopRepeatedClick = false;
            });
        }
    }
}

function goback(){
    //返回
    return {
        onclick:function (ctx,$optInst){
            ctx.processLauncher.back();
        }
    }
}

const opts={
    startProcess,
    approveProcess,
    dismissProcess,
    /*print,*/
    processFormSave,
    goback
};
export default opts;