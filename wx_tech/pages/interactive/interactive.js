import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';
import { utils } from '../../utils/utils.js';

Page({
  data:{
    pageNum: 1,
    hidden: true,
    hasRefesh: false,
    interactData: [],
    isdata: true,
    scrollTop: 0,  
    scrollHeight: 0,
    iscount: false 

  },
  
  onLoad:function(options){
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    })
    that.loadMsgData(that); 
  },
  loadMsgData:function(that){
    var param = {
      "page": that.data.pageNum, 
      "pageSize" : 6
    }; 
    that.setData({  
      hidden:false  
    });
    var allMsg = that.data.interactData;  
    api.get(getUri('interact_lists'), param).then(res => {
      if (res && res.data) {

        if (res.data.error) {
          wx.redirectTo({  
            url:'/pages/error/error', 
          })
        } else {
          const data = res.data.response.data;
          if (res.data.response.data == '') {
            if (allMsg.length != 0) {
              that.setData({
                iscount: true,
              })
            } else {
              that.setData({
               isdata: false,
              })
            }
          } else {
            for(var i = 0; i < data.length; i++){
              data[i].indexPic = utils.createImgSrc(data[i].content_indexpic, { width: 215 });
              allMsg.push(data[i]);

            }
            that.setData({
              interactData: allMsg,
              pageNum: that.data.pageNum+ 1
           });
          }
        }
      }
      wx.hideNavigationBarLoading();
      that.setData({
        hidden:true
      });
    }).catch(res => {
      console.log(res);
      that.setData({
        hidden:true
      });
    }) 
  },

  loadMore:function (e) {
    var that = this;
    if (!this.data.iscount ) {
      this.loadMsgData(that);
    }
  },
  // onPullDownRefresh: function() {
  //   var that = this;
  //   wx.showNavigationBarLoading();
  //   that.setData({
  //     pageNum: 1,
  //     interactData: [],
  //     scrollTop: 0,
  //     iscount: false
  //   })
  //   this.loadMsgData(that)
  // },
  scroll: function (event) {  
    this.setData({  
      scrollTop: event.detail.scrollTop  
    });  
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})
