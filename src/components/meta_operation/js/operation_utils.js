import _ from '../../../js/tool/lodash';
import propParser from '../../../js/tool/prop_parser';
var utils={
    expandOperation:function(operation,ctx){
        var params={};
        _.each(operation.props,function(propValue,propKey){
            if(!propValue.internal){//非来自于context的属性，作为普通操作属性合并到operation中
                var parsedValue=propParser.parse(propValue,ctx);
                params[propKey]=parsedValue;
            }
        });
        //移动端配置的属性将覆盖上面的属性
        _.each(operation.mobileProps,function(propValue,propKey){
            if(!propValue.internal){//非来自于context的属性，作为普通操作属性合并到operation中
                var parsedValue=propParser.parse(propValue,ctx);
                params[propKey]=parsedValue;
            }
        });
        return _.extend(operation,params);
    }
};
export default utils;