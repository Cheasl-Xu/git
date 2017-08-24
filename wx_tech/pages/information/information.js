import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';

Page({
  data:{
    pageNum: 1,
    hidden: true,
    hasRefesh: false,
    systemData: [],
    isFold: true,
    isdata: true,
    scrollTop: 0,  
    scrollHeight: 0,
    iscount: false,
    index: 0,
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
      "count" : 20
    }; 
    that.setData({  
      hidden:false  
    }); 
    var allMsg = that.data.systemData;

    api.get(getUri('system_lists'), param)
      .then(res => {
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
                });
              } else {
                that.setData({
                 isdata: false,
                });
              }
            } else {

              for(var i = 0; i < data.length; i++){
                data[i].sender_name = data[i].sender_name.substr(0, 8);
                if (that.GetLength(data[i].content)) data[i].isExpanded = true;
                else data[i].isExpanded = false;
                data[i].smallContent = data[i].content.substr(0, this.data.index + 1);
                allMsg.push(data[i]);
              }
            }
            that.setData({
              systemData: allMsg,
              pageNum: that.data.pageNum+ 1,
            });
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
      });
  },

  GetLength:function (str) {
    var realLength = 0;
    var len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128) {
        realLength += 1;
      } else {
        realLength += 2;
      }

      if (realLength >= 85) {
        this.setData({
          index: i
        });
        break;
      }
    }
      if (realLength >= 85) {
        return true;
      } else {
        this.setData({
          index: 0
        });
        return false;
      }
    },
  flodFn:function(e){
    const i = e.currentTarget.id;
    const res = this.data.systemData;
    res[i].isExpanded = false;
    res[i].isPackUp = true;
    this.setData({
       systemData: res
    });
  },

  packUp:function(e){
    const i = e.currentTarget.id;
    const res = this.data.systemData;
    res[i].isExpanded = true;
    res[i].isPackUp = false;
    this.setData({
       systemData: res
    });
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
  //     systemData: [],
  //     scrollTop: 0,
  //     iscount: false
  //   })
  //   this.loadMsgData(that)
  // },
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
