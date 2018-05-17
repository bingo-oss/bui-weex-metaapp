/**
 * 提供grid内置的操作
 */
//import metabase from '../../../libs/metadata/metabase';
//import ExportCsv from './export_csv';
//import toolServices from '../../../services/tool/tool_service';
//var pathToRegexp = require('path-to-regexp');
import Utils from '../../../js/tool/utils'
import _ from '../../../js/tool/lodash'
import i18n from '../../../js/i18n/index';
import buiweex from 'bui-weex'

/**
 * 跳转到pageId指定的页面
 * @param {string} pageId 页面id
 * @param {object} _query 页面url query参数
 */
function toPage(pageId,_query){
  let queryParam =_.extend({pageId: pageId},_query);
  buiweex.push(Utils.pageEntry(),queryParam);
}
/**
 * 创建操作，跳转到新建表单页
 * @param context
 */
function operationForCreate(){
  var operation= {
    onclick:function(context,$optInst){
      let pageId=$optInst.operation.page&&$optInst.operation.page.id;
      if(!pageId){
        buiweex.alert(i18n.pageIdNotSet);
        return;
      }
      var _query=_.extend({},operation.queryParams);
      toPage(pageId,_query);
    }
  };
  return operation;
}
function getIdFromContext(context){
  var id=context.selectedId;
  var metaEntity=context.metaEntity;
  if(!id){
    var selectedItem=context.selectedItem;
    if(selectedItem){
      //计算id字段
      var idField=null;
      if( !_.isEmpty(metaEntity)){
        idField=metaEntity.getIdField();
      }
      id=selectedItem[idField];
    }
  }
  return id;
}
/**
 * 编辑操作，跳转到编辑表单页
 * @param context
 */
function operationForEdit(){
  var operation= {
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
      if(!id){
        iview$Modal.error({content:i18n.dataIdNotSet});
        return;
      }
      let pageId=$optInst.operation.page&&$optInst.operation.page.id;
      if(!pageId){
        buiweex.alert(i18n.pageIdNotSet);
        return;
      }
      var _query=_.extend({dataId:id},operation.queryParams);
      toPage(pageId,_query);
    }
  };
  return operation;
}
/**
 * 查看操作，跳转到查看页面
 * @param context
 */
function operationForView(){
  var operation= {
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
      if(!id){
        buiweex.alert(i18n.dataIdNotSet);
        return;
      }
      let pageId=$optInst.operation.page&&$optInst.operation.page.id;
      if(!pageId){
        buiweex.alert(i18n.pageIdNotSet);
        return;
      }
      var _query=_.extend({dataId:id,_action:"view"},operation.queryParams);
      toPage(pageId,_query);
    }
  };
  return operation;
}
/**
 * 删除操作
 * @param {*} context
 */
function operationForDel() {
  var operation= {
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
      if(!id){
        buiweex.alert(i18n.dataIdNotSet);
        return;
      }
      var metaEntity=context.metaEntity;
      var resource=metaEntity.dataResource();
      buiweex.confirm(i18n.confirmDelete,function(ok){
        if(ok==="确定"){
          resource.delete(id).then(function (re) {
            $optInst.$emit("successed","del");
          });
        }
      });
    }
  };
  return operation;
}
/**
 * 保存数据（表单保存）
 * @param {*} context 
 */
function save(){
  var operation= {
    onclick:function(context,$optInst){
      var form=context.form;
      if(_.isEmpty(form)){
        buiweex.alert(`表单保存操作必须传入表单实例参数`);
        return;
      }
      form.doSaveModel();
    }
  };
  return operation;
}

var operations={
  create:operationForCreate,
  edit:operationForEdit,
  view:operationForView,
  del:operationForDel,
  save:save
}

export default {
  /**
   * 根据操作中，创建一个默认的操作
   * @param context
   * @param operationName
   */
  createOperation:function (operationName) {
    if(_.isEmpty(operationName)){
      return null;
    }
    var func=null;
    _.forEach(operations,function (opFunc,key) {
      if(key.toLowerCase()==operationName.toLowerCase()){
        func=opFunc;
        return false;
      }
    });
    if(func!=null){
      return func();
    }
    return null;
  }
}



