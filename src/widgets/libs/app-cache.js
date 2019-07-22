import factoryApp from "./factory-app";
import EventBus from '../../js/bus';
const storage = weex.requireModule('storage');

//缓存对象模型
var app = {
    pageObject(config){
        //页面存储对象信息
        return {
            uid:"",//绑定特定页面的vue标记
            accessTime: 0,//记录下当前页面的访问时间
            id: config.id,//页面id
            title: config.title,//页面名称
            params: config.params,//页面参数
            childs: [],//子页面
            parent: null,//父级页面
            root: null,//根页面
            targetPage: null,//目标页面
            sourcePage: null,//源页面
            widgets: [//页面包含部件
                /*{
                 name:"部件一",//部件名称
                 widgetCode:"",//部件编码
                 index:"",//部件序号
                 params:{}//部件参数
                 }*/
            ]
        }
    },
    params:{},//应用变量
    pages:[],
    sourceAccessTime:"",//记录跳入时候的时间
    targetAccessTime:"",//记录到达目标页面的时间
    init(_this,pageConfig){
        factoryApp.init(_this);
        //初始化页面对象模型
        _this.pageObject = app.pageObject(pageConfig);
        _this.pageObject.accessTime = _this.$getPageParams()['_t'];//读取访问路由的时间
        _this.pageObject.uid = `${_this.pageObject.accessTime}_${pageConfig.id}`;//绑定特定页面的vue标记
        _this.setPage(pageConfig,_this);//存入页面
        app.sourceAccessTime = _this.$getPageParams()['_t'];//记录下跳入后页面的时间
/*        storage.getItem("appCachePages",(res)=>{
            if(res.data&&res.data!="undefined"){
                app.pages = JSON.parse(res.data);
            }
            _this.setPage(pageConfig,_this);//存入页面
            storage.setItem("appCachePages",JSON.stringify(app.pages));
        });//存入浏览过的页面*/
    },
    pageFun:{
        //页面方法
        getParams(key){
            //获取页面参数
            if(this.params){
                return key?this.params[key]:this.params;
            }else{
                return null;
            }
        },
        setParams(key,vale){
            //设置页面参数
            if(!this.params)this.params = {};
            this.params[key] = vale;
            app.change(this);//触发更新
        },
        getwidget(code_index){
            //获取页面下的部件对象
            //传入的是code/序号
            let _obj = null;
            /*this.widgets
             debugger;*/
            _obj = this.widgets.filter((widget)=>{return widget.widgetCode==code_index});
            if(_obj.length){
                return _obj[0];
            }else{
                return this.widgets[code_index];
            }
        },
        getRoot(){
            //返回跟页面对象
            return this.root;
        },
        getParent(){
            //返回父级对象
            return this.parent;
        },
        getChild(id_index){
            //通过id或者序号获取子集页面
            let _obj = this.childs.filter((child)=>{return child.id==id_index});
            if(_obj.length){
                return _obj[0];
            }else{
                return this.childs[id_index];
            }
        },
        getTargetPage(){
            //获取页面的目标页面对象
            return this.targetPage;
        },
        getSourcePage(){
            //获取页面的源页面对象
            return this.sourcePage;
        },
    },
    widgetFun:{
        //部件方法
        getParams(key){
            //获取部件参数
            if(this.params){
                return key?this.params[key]:this.params;
            }else{
                return null;
            }
        },
        setParams(key,vale){
            //设置部件参数
            if(!this.params)return false;
            this.params[key] = vale;
            app.change(this);//触发更新
        }
    },
    change(_this){
        //触发页面更新--与meta-widget-page间传递
        EventBus.$emit("pageChange",_this);
    }
}
let page = {
    getCurrent(){
        //获取当前页面对象
        return app.getPage()
    }
}
let widget = {
    getCurrent(){
        //获取当前页面的当前部件
    }
}

export default app;//缓存起初始结构
/*setPageParams(){},//设置页面参数,
 getPageParams(){},//获取页面参数,
 getwidget(code){},//获取所在页面的部件对象,
 root(){},//获取根页面 ,
 parent(){},//获取父级页面,
 childs(index){},//获取子集页面 ,
 getTargetPage(){},//获取目标页面 ,
 getSourcePage(){},//获取根源页面*/





