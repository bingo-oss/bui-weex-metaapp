//注册page的一些通用方法--调用各个部件的内部方法-需要和factory-api的方法对应以及部件内存在这个方法的实现 才有效
import _ from '../../js/tool/lodash';
import linkapi from "linkapi";
var co = require('co');
var pageMethods = {
    submit(){
        var submitWidgets=[];
        _.each(this.$refs.childWidgets,function(cw){
            if(_.isFunction(cw.submit)){
                submitWidgets.push(cw);
            }
        });
        if(submitWidgets.length===0){
            return Promise.resolve();
        }
        //利用co和generator函数顺序调用部件的submit
        function* nextSubmit(){
            var toYield=[];
            for(let i=0;i<submitWidgets.length;++i){
                let sw=submitWidgets[i];
                toYield.push(new Promise((resolve, reject)=>{
                    let res=sw.submit();
                    res.then((data)=>{resolve(data)},()=>{reject()});
                }));
            }
            return yield toYield;
        }
        return co(nextSubmit);
    },
    refresh(){
        //执行引用部件的刷新操作
        _.each(this.$refs.childWidgets,function(cw){
            if(_.isFunction(cw.refresh)){
                cw.refresh();
            }
        });
    },
    formCheck(){
        //表单检测
        var formCheckWidgets=[];
        _.each(this.$refs.childWidgets,function(cw){
            if(_.isFunction(cw.formCheck)){
                formCheckWidgets.push(cw.formCheck());
            }
        });
        return formCheckWidgets;
    },
    getData(){
        //获取表单数据
        var getDataWidgets=[];
        _.each(this.$refs.childWidgets,function(cw){
            if(_.isFunction(cw.getData)){
                getDataWidgets.push(cw.getData());
            }
        });
        return getDataWidgets;
    },
    startLoading(){
        //显示加载圈
        if(_.isEmpty(this.startLoadingNumber)){
            this.startLoadingNumber  = 0;
        }
        this.startLoadingNumber++;//需要累加的加载圈
        if(this.startLoadingNumber==1){
            linkapi.showLoading({title:"加载中"});
        }//只调用一次
    },
    stopLoading(){
        //关闭加载圈
        this.startLoadingNumber--;//需要累加的加载圈
        if(this.startLoadingNumber==0){
            linkapi.hideLoading();
        }
    }
}

export default pageMethods




