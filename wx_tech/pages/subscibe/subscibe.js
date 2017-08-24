import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';
import { utils } from '../../utils/utils.js';

var app = getApp()
Page({
  data: {
    hidden: true,
    scrollTop: 0,
    hasMore: false,
    loadding: true,
    errorTip:'',
    height:''
  },
  onShow() {
    var that = this;
    this.data.subscibe = [];
    this.data.list = [];
    this.data.count = {
        page : 1,
        size : 10,
        num : '',
        sum : ''
    },
    app.getSystemInfo(function(res) {
      that.setData({
        height: res.windowHeight-114
      })
    })

    app.check(function(code) {
      if (code > 0) {
        that.getSubscibe()
      }else{
        wx.redirectTo({
          url: '/pages/error/error',
        })
      }
    })
  },
  getSubscibe() {
    var that = this;
    if (that.data.count.num && that.data.count.page > that.data.count.num){
      that.setData({
        hasMore: false
      });
      return false;
    }

    var params = {
      page:that.data.count.page,
      count:that.data.count.size
    }
    api.get(getUri('user_order', 'tech'),params).then(res => {
      if (res.statusCode == 200) {
        wx.stopPullDownRefresh();
        var data = res.data;
        if (data.error || data.message) {
          wx.redirectTo({
            url:'/pages/error/error',
          })
          that.data.errorTip = data.message || data.error || "访问错误";
          that.setData({
            errorTip:that.data.errorTip,
            hasMore: false,
            loadding: false
          });
        }else if(data && data.response.page && data.response.data && data.response.data[0]){
          that.data.count.num = data.response.page.last_page
          that.data.count.sum = data.response.page.total
          that.data.list = that.data.list.concat(data.response.data)
          for (var i = 0; i < data.response.data.length ;i++){
            if (data.response.data[i].indexpic){
              data.response.data[i].indeximg = utils.createImgSrc(data.response.data[i].indexpic , {width: 400})
            }
          }
          that.setData({
            subscibe: that.data.list,
            count:that.data.count,
            errorTip:''
          });
        }else{
        	that.setData({
        	subscibe: [],
            errorTip:'还没有内容呦～',
            hasMore: false
          });
        }
      }else{
        wx.redirectTo({
          url:'/pages/error/error',
        })
      }
      that.setData({
        loadding: false
      });
    }).catch(res => {
      that.setData({
        loadding: false
      });
      wx.redirectTo({
      	url:'/pages/error/error',
	  })
    })
  },
  onPullDownRefresh:function() {
    var that = this;
    that.data.count.page = 1;
    that.data.list = [];
    that.getSubscibe();
  },
  loadMore(){
    var that = this;
      that.setData({
        hasMore: true
      });
      that.data.count.page++;
      that.getSubscibe()
  }
})
