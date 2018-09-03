import ajax from '../../../js/ajax.js';
import buiweex from 'bui-weex';
import _ from '../../../js/tool/lodash';
const linkapi = require('linkapi');

const service={
    jzyXml(vue,data){
        //佳兆业企业oa-xml解析;--操作解析
        if(vue.items.length==0){
            //不存在选项集需要重新渲染
            _.each(vue.getXmlTagNameContent(data,"gxoptions"),(gxatt)=>{
                _.each(vue.getXmlTagNameContent(gxatt,"gxoption"),(att)=>{
                    if(att.indexOf("<option")!=-1){
                        _.each(vue.getXmlTagNameContent(att,"option"),(content)=>{
                            vue.items.push({
                                disname:vue.liftOff(vue.getXmlTagNameContent(att, "disname").join(""),"disname"),
                                value:vue.getXmlAttr(content,"option","value")[1],
                                title:vue.getXmlAttr(content,"option","text")[1]
                            });//流程意见
                        });
                    }
                });//获取表单流程轨迹信息
            });
            //vue.items.push({value:"驳回", title:"驳回"});
            vue.submission.selectedItem = vue.items[0].value//默认选择第一个
        }
        _.each(vue.getXmlTagNameContent(data,"gx_sendtransfer"),(gxatt)=>{
            //console.log(gxatt)
            _.each(vue.getXmlTagNameContent(gxatt,"gx_transferuser"),(transferuser)=>{
                let _transfer = {
                    text:vue.getXmlAttr(transferuser, "gx_transferuser", "text")[1],
                    id:vue.getXmlAttr(transferuser, "gx_transferuser", "id")[1],
                    users:[]
                };//流程环节名
                _.each(vue.getXmlTagNameContent(transferuser,"user"),(user)=> {
                    _transfer.users.push({
                        text:vue.getXmlAttr(user, "user", "text")[1],
                        id:vue.getXmlAttr(user, "user", "id")[1],
                        transfer:vue.getXmlAttr(user, "user", "transfer")[1],
                    });//存入对应的用户
                });
                vue.sendtrans[vue.submission.selectedItem] = _transfer;//存入信息
                vue.submission.sendtran = vue.sendtrans[vue.submission.selectedItem];
            });//获取下一环节信息
        });
    },
    jzyXmlOption(vue,val){
        //佳兆业选项操作
        if(val=="同意"){
            vue.query.tag="tongyi"
        }else if(val=="不同意"){
            vue.query.tag="butongyi"
        }else{
            //驳回
            vue.query.tag="bohuibuchong"
        }
        if(vue.sendtrans[val]){
            vue.submission.sendtran = vue.sendtrans[val];
            //myXml(vue.sendtrans[val]);
        }else{
            vue.getData();
        }
    },
    jzyPost(vue){
        //佳兆业提交数据操作
        let _userXml="",//选择的用户结构;
            users = vue.submission.sendtran.users;
        for(var user of users){
            _userXml+=`<user transfer='${user.transfer}' id='${user.id}' text='${user.text}' />`
        }
        //console.log(vue.postXml);
        //console.log(vue.postXml.match(/<gxdata>([\s\S]*?)<\/gxdata>/g));
        let _postXml = `<?xml version="1.0" encoding="utf-8"?><docrecord><gxuser>${vue.getXmlTagNameContent(vue.postXml,"pin")[0]}</gxuser>${vue.postXml.match(/<gxdata>([\s\S]*?)<\/gxdata>/g)}<gxoptions><param><name><![CDATA[${vue.items[0].disname}]]></name><value><![CDATA[${vue.submission.selectedItem}]]></value></param></gxoptions><gxcomm><mycomm><disname><![CDATA[审批意见]]></disname><text><![CDATA[${vue.submission.comm}]]></text></mycomm></gxcomm><gx_sendtransfer>${_userXml}</gx_sendtransfer></docrecord >`;

        //获取数据
        let _t  = vue, _widgetParams = vue.widgetParams;
        if(_widgetParams.oaSend&&_widgetParams.oaSend.query){
            let _getPageParams = _t.$getPageParams(),_queryParam = _widgetParams.oaSend.query.split(","),_query = _t.query;
            let queryParam = Object.assign({
                url:"",
                method:'POST',
                body: {},
                type:"text"
            },_widgetParams.oaSend);
            if(queryParam.url.indexOf("?")<0){
                queryParam.url+="?";
            }
            _.each(_queryParam,(val,index)=>{
                if(_query[val]){
                    //优先取设置的参数
                    queryParam.url +="&"+val+"="+_query[val];
                }else if(_getPageParams[val]){
                    //链接上的参数
                    queryParam.url +="&"+val+"="+_getPageParams[val];
                }
            });
            queryParam.url+="&UserID=oaadmin";
            queryParam.url  = queryParam.url;
            queryParam.body = _postXml;
            _t.isShowLoading = true;
            ajax.request(queryParam).then(function(res){
                _t.isShowLoading = false;
                if(res.ok){
                    buiweex.alert("提交成功！");
                    buiweex.pop();
                }else{
                    buiweex.alert("异常处理")
                }
            });
        }




    }
};
export default service;