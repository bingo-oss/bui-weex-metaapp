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
    },
    myXml(vue,data){
        //明源--xml解析--操作解析

        //需要请求数据xml
        /**/
        vue.postXml = ``;//先静态写死结构

        //需要请求操作权限xml
        /*http://192.168.1.98:8301/MyWorkflow/WF_Engine_XmlHTTP.aspx?ywtype=GetSysActiveNumber&ywonlyflag=d5167091-0eb0-e811-80fc-005056b036bb&ywtxt=&rdnum=0.28587644058627&MySessionState=0059fc5c-09b0-e811-80fc-005056b036bb返回信息:*/
         let _optionShow = "1,4,,041D011A-D6F4-E611-80E0-005056B036BB";


        //需要请求操作xml
        /*http://192.168.1.98:8301/MyWorkflow/WF_XmlHTTP.aspx?ywtype=GetDefaultOpinion&ywonlyflag=&ywtxt=&rdnum=0.5587772578003363&MySessionState=0059fc5c-09b0-e811-80fc-005056b036bb*/
        var _option = `<xml><opinion oprtype="发起">发起</opinion><opinion oprtype="重新发起">重新发起</opinion><opinion oprtype="指派">指派</opinion><opinion oprtype="同意">同意</opinion><opinion oprtype="中止">中止流程</opinion><opinion oprtype="打回">打回流程</opinion><opinion oprtype="作废">作废流程</opinion><opinion oprtype="发起协商">发起协商</opinion><opinion oprtype="回复协商">回复协商</opinion><opinion oprtype="会签">会签</opinion><opinion oprtype="交办">交办流程</opinion><opinion oprtype="归档">归档</opinion></xml>`;

        if(vue.items.length==0){
            //不存在选项集需要重新渲染
            _optionShow = _optionShow.split(",");
            _.each(vue.getXmlTagNameContent(_option,"opinion"),(opinion,index)=>{
                let _text = vue.liftOff(opinion,"opinion");
                for(var x in _optionShow){
                    if(_optionShow[x]!==""&&_optionShow[x]==index){
                        vue.items.push({
                            disname:_text,
                            value:_text,
                            title:_text
                        });//需要显示的操作
                    }
                }
            });
            vue.submission.selectedItem = vue.items[0].value//默认选择第一个
        }



        //需要请求环节信息
        //同意的环节信息--
        /*http://192.168.1.98:8301/MyWorkflow/WF_Engine_XmlHttp.aspx?stepGUID=9806bd2c-44af-e811-80fc-005056b036bb&lastStationGUID=ce34fd7b-4278-e311-974d-005056b04a97&nodeGUID=d5167091-0eb0-e811-80fc-005056b036bb&ywtype=GetStepPassGuideXML&ywonlyflag=&ywtxt=&rdnum=0.8724961088433156&MySessionState=0059fc5c-09b0-e811-80fc-005056b036bb*/
        //不同意的环节信息
        /*http://192.168.1.98:8301/MyWorkflow/WF_Engine_XmlHttp.aspx?ywtype=ProcessGuide_GetStepDisApproveGuide&ywonlyflag=419250b6-5faf-e811-80fc-005056b036bb&ywtxt=ce34fd7b-4278-e311-974d-005056b04a97&rdnum=0.257193983671291&MySessionState=0059fc5c-09b0-e811-80fc-005056b036bb*/
        var _sendtrans = `<xml CanSameAuditorOverpass="1" CurNodeAuditor=""><Step><Relation otype="1" NextStepGUID="a106bd2c-44af-e811-80fc-005056b036bb" NextStepName="集团业务部门经理" StepType="1" IsMulti="0" StepID="3" Expression="( [申请部门] 等于 '集团控股行政及人力资源部' ) 且 ((( [款项分类] 等于 '01' ) 且 ( [申请金额(￥)] 大于 10000 )) 或 (( [款项分类] 不等于 '01' )))" ExpressionStru="&lt;ExpressionStru&gt;&lt;filter leftparenthesis=&quot;(&quot; domain=&quot;申请部门&quot; opr=&quot;==&quot; value=&quot;集团控股行政及人力资源部&quot; rightparenthesis=&quot;)&quot; logic=&quot;&amp;amp;&amp;amp;&quot;/&gt;&lt;filter leftparenthesis=&quot;(((&quot; domain=&quot;款项分类&quot; opr=&quot;==&quot; value=&quot;01&quot; rightparenthesis=&quot;)&quot; logic=&quot;&amp;amp;&amp;amp;&quot;/&gt;&lt;filter leftparenthesis=&quot;(&quot; domain=&quot;申请金额(￥)&quot; opr=&quot;&amp;gt;&quot; value=&quot;10000&quot; rightparenthesis=&quot;))&quot; logic=&quot;||&quot;/&gt;&lt;filter leftparenthesis=&quot;((&quot; domain=&quot;款项分类&quot; opr=&quot;!=&quot; value=&quot;01&quot; rightparenthesis=&quot;)))&quot; logic=&quot;&amp;amp;&amp;amp;&quot;/&gt;&lt;/ExpressionStru&gt;" Mode="NextStep" Auditor="b8084b4b-f52f-4bc1-b3bd-2764b6210622" AuditorName="刘涛(集团控股)" AuditorCount="1" /><Relation otype="1" NextStepGUID="9806bd2c-44af-e811-80fc-005056b036bb" NextStepName="集团业务部门经理" StepType="1" IsMulti="0" StepID="11" Expression="[申请部门] 不等于 '集团控股行政及人力资源部'" ExpressionStru="&lt;ExpressionStru&gt;&lt;filter leftparenthesis=&quot;&quot; domain=&quot;申请部门&quot; opr=&quot;!=&quot; value=&quot;集团控股行政及人力资源部&quot; rightparenthesis=&quot;&quot; logic=&quot;&amp;amp;&amp;amp;&quot;/&gt;&lt;/ExpressionStru&gt;" Mode="NextStep" Auditor="b8084b4b-f52f-4bc1-b3bd-2764b6210622" AuditorName="刘涛(集团控股)" AuditorCount="1" /><Relation otype="1" NextStepGUID="9606bd2c-44af-e811-80fc-005056b036bb" NextStepName="集团行政费用登记专员" StepType="1" IsMulti="0" StepID="15" Expression="( [款项分类] 等于 '01' ) 且 ( [申请金额(￥)] 小于等于 10000 ) 且 ( [申请部门] 等于 '集团控股行政及人力资源部' )" ExpressionStru="&lt;ExpressionStru&gt;&lt;filter leftparenthesis=&quot;(&quot; domain=&quot;款项分类&quot; opr=&quot;==&quot; value=&quot;01&quot; rightparenthesis=&quot;)&quot; logic=&quot;&amp;amp;&amp;amp;&quot;/&gt;&lt;filter leftparenthesis=&quot;(&quot; domain=&quot;申请金额(￥)&quot; opr=&quot;&amp;lt;=&quot; value=&quot;10000&quot; rightparenthesis=&quot;)&quot; logic=&quot;&amp;amp;&amp;amp;&quot;/&gt;&lt;filter leftparenthesis=&quot;(&quot; domain=&quot;申请部门&quot; opr=&quot;==&quot; value=&quot;集团控股行政及人力资源部&quot; rightparenthesis=&quot;)&quot; logic=&quot;&amp;amp;&amp;amp;&quot;/&gt;&lt;/ExpressionStru&gt;" Mode="NextStep" Auditor="6ed57b76-ccdf-e711-80ed-005056b036bb" AuditorName="邓子荣" AuditorCount="1" /></Step><CC CCUserName="" CCUserGUID="" /><MsgMask MailC="0" MailD="1" SMSC="0" SMSD="1" /><AutoBook>0</AutoBook><Finalize>0</Finalize></xml>`;//环节信息--静态数据是同意

        _.each(vue.getXmlTagNameContent(_sendtrans,"Relation"),(Relation)=>{
            let _transfer = {
                text:vue.getXmlAttr(Relation, "Relation", "NextStepName")[1],
                xml:Relation,
                users:[]
            };//流程环节名
            _transfer.users.push({
                text:vue.getXmlAttr(Relation, "Relation", "AuditorName")[1],
            });//存入对应的用户
            vue.sendtrans[vue.submission.selectedItem] = _transfer;//存入信息
            vue.submission.sendtran = vue.sendtrans[vue.submission.selectedItem];
        });//获取下一环节信息
        //环境信息
    },
    myXmlOption(vue,val){
        //明源选项操作
        if(vue.sendtrans[val]){
            vue.submission.sendtran = vue.sendtrans[val];
            //myXml(vue.sendtrans[val]);
        }else{
            vue.getData();
        }
    },
    myPost(vue){
        let _postXml = vue.submission.sendtran.xml,_postContextXml;
        //_postXml+=vue.postXml;
        if(_postXml.indexOf("Rollback")!=-1){
            //打回的xml结构
            /*`<DisApprove result="true"><Rollback StepPathGUID="3F9250B6-5FAF-E811-80FC-005056B036BB" StepPathID="5" StepName="发起" IsCurrent="0" NodeNum="1" Auditor="潘晓松" /><Notice MailC="0" MailD="1" SMSC="0" SMSD="1" /></DisApprove>`*/
            let _Relation = vue.getXmlTagNameContent(_postXml,"Rollback")[0];
            //打回
            _postContextXml = `<Context><Handle type="RollBack"><RollBack steppathguid="${vue.getXmlAttr(_Relation, "RollBack", "StepPathGUID")[1]}" IsPathAgain="1" AuditorName="${vue.getXmlAttr(_Relation, "RollBack", "Auditor")[1]}" Auditor=""/></Handle>`;
        }else{
            //发起的xml结构
            /*`<xml CanSameAuditorOverpass="1" CurNodeAuditor="4431f37e-27af-e311-a9ca-005056b04a97"><Step><Relation otype="1" NextStepGUID="9906bd2c-44af-e811-80fc-005056b036bb" NextStepName="集团业务分管高管" StepType="1" IsMulti="0" StepID="12" Expression="" ExpressionStru="&lt;ExpressionStru/&gt;" Mode="NextStep" Auditor="b8084b4b-f52f-4bc1-b3bd-2764b6210622" AuditorName="刘涛(集团控股)" AuditorCount="1" /></Step><CC CCUserName="" CCUserGUID="" /><MsgMask MailC="0" MailD="1" SMSC="0" SMSD="1" /><AutoBook>0</AutoBook><Finalize>0</Finalize></xml>`*/
            let _Relation;
            /*_.each(vue.getXmlTagNameContent(_postXml,"Relation"),(Relation)=>{

            });//存在多个Relation节点的时候*/
            _Relation = vue.getXmlTagNameContent(_postXml,"Relation")[0];
            //发起
            _postContextXml = `<Handle type="ReInitiate"><Action type="NextStep"><NextStepGUID>${vue.getXmlAttr(_Relation, "Relation", "NextStepGUID")[1]}</NextStepGUID><Auditors><User guid="${vue.getXmlAttr(_Relation, "Relation", "Auditor")[1]}" name="${vue.getXmlAttr(_Relation, "Relation", "AuditorName")[1]}"/></Auditors></Action></Handle>`;
        }

        _postContextXml = `<Context>${_postContextXml}<MsgMask>00</MsgMask><CC></CC><Params><HandleText>${vue.submission.comm}</HandleText><StationGUID>ce34fd7b-4278-e311-974d-005056b04a97</StationGUID><NodeGUID>d5167091-0eb0-e811-80fc-005056b036bb</NodeGUID><ProcessNo>佳兆业集团工商管理平台项目开发合同-付款申请-2252</ProcessNo><NextNodeNum>1</NextNodeNum><DomainXml></DomainXml></Params></Context>`;

        console.log(_postContextXml);


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
            //提交接口
            /*MyWorkflow/WF_Engine_XmlHTTP.aspx?ywtype=ProcessHandle&ywonlyflag=&ywtxt=&rdnum=0.20379044057843704&MySessionState=0059fc5c-09b0-e811-80fc-005056b036bb*/
            queryParam.url+="&UserID=oaadmin";
            queryParam.url  = queryParam.url;
            queryParam.body = _postXml;
            //_t.isShowLoading = true;
            /*ajax.request(queryParam).then(function(res){
                _t.isShowLoading = false;
                if(res.ok){
                    buiweex.alert("提交成功！");
                    buiweex.pop();
                }else{
                    buiweex.alert("异常处理")
                }
            });*/
        }
    }
};
export default service;