import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';

Page({
  data:{
    feedContent: '',
    concact: '',
    isShowToast: false,
    tips: '',
    duration: 1500
  },
  // 获取反馈内容
  getTexteareContent: function(e) {
    this.setData({
      feedContent: e.detail.value
    })
  },
  getConcactContent: function(e) {
    this.setData({
      concact: e.detail.value
    })
  },
  // 反馈提交
  showToast: function(msg, cb) {
    if (this.data.isShowToast) {
      return false;
    }
    this.setData({
      tips: msg,
      isShowToast: true
    })
    setTimeout(function(){
      this.setData({
        isShowToast: false
      })
      cb && cb();
    }.bind(this), this.data.duration);
  },
  saveFeedback: function(){
    const feedback = this.data.feedContent;
    const concact = this.data.concact;
    if (!feedback) {
      this.showToast('问题不能为空');return;
    }
    if (!concact) {
      this.showToast('联系方式不为空');return;
    }
    const params = {
      content: feedback,
      way: concact
    };
    const _this = this;
    api.post(getUri('feedback_add'), params).then(response => { // 处理接口200时的逻辑
      if ('message' in response.data) {
        const msg = response.data.message;
        _this.showToast(msg);
      } else {
        const success = parseInt(response.data.response.success);
        if (success === 1) {
          _this.showToast("感谢您的反馈", ()=>{
            wx.navigateBack({});
          });
        }
      }
    }).catch(res => { // 处理接口非200时的逻辑
      console.log(res);
    })
  }
})
