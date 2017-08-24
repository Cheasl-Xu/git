import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';
import { utils } from '../../utils/utils.js';

var app = getApp();
Page({
  data:{
    active: true,
    id:'',
    errorTip:'',
    contenterrorTip:'',
    columnForm:{},
    columnContent:[],
    loadding:true,
    hasMore: false,
    count: {
      page: 1,
      size: 10,
      num: "",
      sum: "",
    },
    footer:false,
    canIUse: wx.canIUse('rich-text.nodes')
  },
  onLoad:function(e){
    var that = this
    if(!e.cid){
      that.setData({
        errorTip:'链接错误'
      })
      return false;
    }
    that.setData({
      id:e.cid
    })
     app.check(function(){
     	that.getColumnform()
      that.getColumncontent()
     })
    
  },
  getColumnform: function(){
    var that = this;
    that.setData({
      loadding: true
    })
    api.get(getUri('column_detail', 'tech').replace('{id}',that.data.id),{}).then( res => {
      if(res.statusCode == 200){
        var data = res.data;
        if(data.error || data.message){
          wx.redirectTo({
            url:'/pages/error/error',
          })
        }else{
          if(data.response.data.indexpic){
            data.response.data.indeximg = utils.createImgSrc(data.response.data.indexpic , {width: 1500})
          }
          if(that.data.canIUse){
            data.response.data.describe = utils.replaceRichText(data.response.data.describe);
          }else{
            data.response.data.describe = data.response.data.describe.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,'').replace(/&amp;/g,'&');
          }
          wx.setNavigationBarTitle({  title: data.response.data.title })
          that.setData({
            columnForm: data.response.data
          })
        }
      }
      that.setData({
        loadding: false,
        footer:true
      });
    }).catch(res => {
      that.setData({
        loadding: false
      });
    })
  },
  onShareAppMessage() {
  	var that = this;
    return {
      title: that.data.columnForm.title,
      path: '/pages/column/column?cid='+that.data.id
	  }
  },
  getColumncontent: function(){
    var that = this;
    if((that.data.columnContent && that.data.columnContent[0]) || that.data.contenterrorTip){
      return false;
    }else{
      if (that.data.count.num && that.data.count.page > that.data.count.num){
        that.setData({
          hasMore: false
        });
        return false;
      }
      that.setData({
        loadding: true
      });

      var param = {
        page:that.data.count.page,
        count:that.data.count.size,
        column_id:that.data.id,
        source : 'wx_applet'
      }
      api.get(getUri('column_contents', 'tech'),param).then( res => {
        if(res.statusCode == 200){
          var data = res.data;
          if(data.error || data.message){
            that.data.contenterrorTip = data.message || data.error || '访问错误';
            that.setData({
              contenterrorTip: that.data.contenterrorTip,
              hasMore: false,
              loadding: false
            })
          }else if(data.response.data && data.response.data[0]){
            that.setData({
              active : false
            })
            that.data.count.num = data.response.page.last_page
            that.data.count.sum = data.response.page.total
            for(var i=0; i<data.response.data.length; i++){
              data.response.data[i].indeximg = utils.createImgSrc(data.response.data[i].indexpic , {width: 822})
              if(data.response.data[i].type == 'live'){
                data.response.data[i].link = '/pages/live/live'
              }else{
                data.response.data[i].link = '/pages/form/form?type=' + data.response.data[i].type + '&cid=' + data.response.data[i].content_id
              }
            }
            that.data.contenterrorTip = '';
            that.setData({
              columnContent:data.response.data,
              contenterrorTip:that.data.contenterrorTip,
              count:that.data.count
            })
          }else{
            that.setData({
              contenterrorTip:'这还没有内容呦～',
              hasMore: false
            })
          }
        }
        that.setData({
          loadding: false
        });
      }).catch( res => {
        that.setData({
          loadding: false
        });
      })
    }
  },
  change (event) {
    var type = event.currentTarget.dataset.type;
    var that = this;
    if (type == "detail"){
      that.setData({
        active : true
      })
    } else if (type == "content"){
      that.setData({
        active : false
      })
    }
    
  },
  loadMore(){
    var that = this;
    that.setData({
      hasMore: true
    });
    that.data.count.page++;
    that.getColumncontent()
  }
})
