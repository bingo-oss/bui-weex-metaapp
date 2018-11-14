var linkapi = require("linkapi"), globalEvent = weex.requireModule('globalEvent');
var mixins = {
    data: function () {
        return {
            themeBg:"#4CA4FE"//link主题颜色
        }
    },
    components: {},
    methods: {
        "noiPhone":function(){
            return (weex.config.env.deviceModel.indexOf("iPhone")==-1)
        },
        "isipx":function () {
            return weex && (weex.config.env.deviceModel === 'iPhone10,3' || weex.config.env.deviceModel === 'iPhone10,6');
        },
        "getThemeColor":function(){
            let t = this;
            try {
                //调试客户端内抛出异常
                linkapi.getThemeColor(function (res) {
                    if (res["background_color"]) {
                        t.themeBg = res["background_color"];//获取系统主题色调
                    }
                });
            }catch (e){
            }
        }
    },
    created(){
        this.getThemeColor();
    }
}

export default mixins;