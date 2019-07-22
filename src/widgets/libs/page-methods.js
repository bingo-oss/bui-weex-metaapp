//注册page的一些通用方法--调用各个部件的内部方法-需要和factory-app的方法对应以及部件内存在这个方法的实现 才有效
import _ from '../../js/tool/lodash';
import linkapi from "linkapi";
import appCahe from "./app-cache";
var co = require('co');
var methods = {
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
    //构建缓存模型的方法
    parentPage(_this) {
        //追溯到page部件
        var _parent=_this;
        while(_parent){
            if(_parent.widgetContainer){
                return _parent;
            }else{
                _parent=_parent.$parent;
            }
        }
        return null;
        /*if (_this.widgetContainer) {
         return _this
         } else if (_this.$parent) {
         return methods.parentPage(_this.$parent)
         } else {
         return null
         }*/
    },
    setRoot(childs,_rootObj){
        //为子页面对象存入跟节点
        _.each(childs,(child)=>{
            child.root = _rootObj;
            if(child.childs&&child.childs.length){
                //还存在子集
                methods.setRoot(child.childs,_rootObj);
            }
        });
    },
    setTargetOrSourcePage(obj){
        //设置跳入此页面的目标页面
        _.each(appCahe.pages,(page)=>{
            if(page.accessTime==appCahe.sourceAccessTime){
                page.targetPage = obj;//则当前页面为跳入时的时间一致的页面的目标页面
                obj.targetPage = page;//当前页面对象的源页面则是跳入的页面
            }
        })
    },
    setPage(config,_this){
        //页面配置,部件,父级页面id
        //存入页面缓存
        _this.pageObject.widgets = [];//清空下内存部件
        Object.assign(_this.pageObject,appCahe.pageFun);//为每个页面对象初始化页面方法
        if(_this.pageConfig) {
            _.each(_this.columnWidgets, (w)=> {
                w.uid = `${_this.pageObject.accessTime}_${_this.pageObject.id}`;//部件关联的页面标识,通过这个更新特定页面的特定部件参数
                Object.assign(w,appCahe.widgetFun);//为每个部件对象初始化部件方法
                _this.pageObject.widgets.push(w);
            })//遍历下配置下的部件
        }
        if(_this.$parent&&methods.parentPage(_this.$parent)){
            //子页面与父页面在同一层级
            let _parentPage = methods.parentPage(_this.$parent)
            _this.pageObject.parent = _parentPage.pageObject;//当前页面的parent关联
            if(!_parentPage.pageObject.childs.filter(page=>{return page.uid==_this.pageObject.uid}).length) {
                //判断是否子集页面重复
                _parentPage.pageObject.childs.push(_this.pageObject);//push到父级的页面对象内
            }
            _this.setPage(_parentPage.pageObject,_parentPage);
        }else{
            /*if(window.parentPage) {
                //嵌套在iframe内
                _this.pageObject.parent = window.parentPage;//当前页面的parent关联
                if(!window.parentPage.childs.filter(page=>{return page.uid==_this.pageObject.uid}).length){
                    //判断是否子集页面重复
                    window.parentPage.childs.push(_this.pageObject);//push到父级的页面对象内
                }
            }*/
            methods.setTargetOrSourcePage(_this.pageObject);//建立目标页面以及源页面关系
            if(_this.pageObject.childs){
                //存在子页面结构 则要设回到root根部
                methods.setRoot(_this.pageObject.childs,_this.pageObject);
            }
            if(appCahe.pages.filter(obj=>{return obj.accessTime==_this.pageObject.accessTime}).length==0){
                appCahe.pages.push(_this.pageObject);
            }//不存在则添加进来
            //console.log(appCahe.pages);
        }
    },
    setwidgetParams(code,params){
        //设置部件参数
        _.each(this.columnWidgets,(w)=>{
            if(w.widgetCode==code||!code) {
                //判断是否对应code的部件
                Object.assign(w.params,params);
            }
        });
    }
}

export default methods




