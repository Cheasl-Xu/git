import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';
const app = getApp();

Page({
  data:{
    nickName:'',
    userInfoAvatar:'',
    system_numbers: 0,
    interact_numbers: 0,
    height:'',
    hasUserInfo: false
  },
  onLoad: function(){
    var that = this;
    app.getSystemInfo(function(res) {
      that.setData({
        height: res.windowHeight-124
      })
    })

    app.check(function() {
      that.getUserDetail();
      that.getUnreadMsg();
    })
  },
  onShow: function() {
    if (this.data.hasUserInfo) {
      this.getUserDetail();
      this.getUnreadMsg();
    }
  },
  getUserDetail: function() {
    const _this = this;
    api.get(getUri('user_detail')).then(res => {
      if (res && res.data) {
        const data = res.data;
        if (data.error) {
          console.warn(data.error || data.message)
        } else {
          const userInfo = data.response;
          this.setData({
            nickName: userInfo.nick_name,
            userInfoAvatar: userInfo.avatar,
            hasUserInfo: true
          })
        }
      }
    })
    .catch(res => {
      console.log(res);
    })
  },
  getUnreadMsg: function() {
    const _this = this;
    api.get(getUri('unread_msg')).then(res => {
      if (res && res.data) {
        const data = res.data;
        if (data.error) {
          console.warn(data.error || data.message)
        } else {
          _this.setData({
            interact_numbers: data.response.interact_numbers,
            system_numbers: data.response.system_numbers
          })
        }
      }
    }).catch(res => {
      console.log(res);
    })
  }
})
