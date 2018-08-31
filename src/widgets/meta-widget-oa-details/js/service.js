import ajax from '../../../js/ajax.js';
import buiweex from 'bui-weex';
import _ from '../../../js/tool/lodash';
const linkapi = require('linkapi');

const service={
    myXml(vue,data){
        //明源企业oa-xml解析;
        let _t  = vue;
        if(data.indexOf("<type")!=-1) {
            _t.state = _t.liftOff(_t.getXmlTagNameContent(data, "type").join(""), "type");
        };//获取文档状态
        _.each(_t.getXmlTagNameContent(data,"field"),(field,index)=>{
            _t.fields.push({
                disname: _t.liftOff(_t.getXmlTagNameContent(field, "disname").join(""),"disname"),
                text:_t.liftOff(_t.getXmlTagNameContent(field,"text").join(""),"text")
            });//获取表单字段信息
        });
        _.each(_t.getXmlTagNameContent(data,"gxatts"),(gxatt,index)=>{
            _.each(_t.getXmlTagNameContent(gxatt,"att"),(att,index)=>{
                _t.attachment.push({
                    name: _t.liftOff(_t.getXmlTagNameContent(att, "disname").join(""),"disname"),
                    downloadUrl:_t.liftOff(_t.getXmlTagNameContent(att,"url").join(""),"text")
                });
            });//获取表单附件字段信息
        });
        _.each(_t.getXmlTagNameContent(data,"gxoptions"),(gxatt,index)=>{
            _.each(_t.getXmlTagNameContent(gxatt,"gxoption"),(att,index)=>{
                if(!_t.getXmlTagNameContent(att, "para"))return true;
                let trail_data = {
                    name:_t.liftOff(_t.getXmlTagNameContent(att, "para").join(""),"para"),
                    content:[],
                    color:"#ccc",
                    textColor:"#ccc",
                    approvalTrailw:{},
                    dotStyle:{"background-color":"#DFDFDF"}
                }

                _.each(_t.getXmlTagNameContent(att,"content"),(content,index)=>{
                    let _name = _t.liftOff(_t.getXmlTagNameContent(content, "disname").join(""),"disname");
                    trail_data.content.push({
                        name:_name?_name.split(" ")[0]:"",
                        comm:_t.liftOff(_t.getXmlTagNameContent(content, "text").join(""),"text"),
                        time:_name?(_name.split(" ")[1]+" "+_name.split(" ")[2]):""
                    });//流程意见
                });
                _t.trail.push(trail_data);
            });//获取表单流程轨迹信息

            if(gxatt.indexOf("<option")==-1){
                //不存在选项集--对应当前用户无法处理
                _t.state = 2;
            }
        });
        if(_t.trail.length) {
            _t.trail.reverse();//数组执行下倒叙
            Object.assign(_t.trail[0], {
                select: true,
                color: "#5099F4",//高亮dot
                textColor: "#000",//高亮文字
                dotStyle: {"background-color": "#5099F4"}
            });
            _t.trail[(_t.trail.length - 1)].borderLeftWidth = {"border-left-width": 0};//不需要显示线条
        }else{
            _t.trail = [];
        }
    }
};
export default service;