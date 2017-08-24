import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';
const app = getApp();
var sexItems = [
  {
    label: '男',
    value: 'Man',
    id: 1,
  },
  {
    label: '女',
    value: 'Woman',
    id: 2
  },
  {
    label: '未知',
    value: 'unknown',
    id: 0,
  }
];
var modelType = {
  nickname: '请输入昵称',
  username: '请输入真实姓名',
  company: '请输入公司名称',
  mobile: '请输入手机号码'
};
var pageObject = {
  data: {
    actionSheetHidden: true,
    actionSheetItems: sexItems,
    sex: '',
    sexId: '',
    date: '',
    username: '',
    mobile: '',
    company: '',
    address: '',
    modalHidden: true,
    modalTitle: '',
    nickName: '',
    userInfoAvatar: '',
    changeType: '',
    changeValue: '',
    isShowToast: false,
    tips: '',
    duration: 1500,
    hidden: true,
    uploadImg: '',
    loadingText: '保存中...'
  },
  onLoad:function(){
    this.getUserDetail();
  },
  getUserDetail: function() {
    const _this = this;
    api.get(getUri('user_detail')).then(response => {
      if ('message' in response.data) {
        const msg = response.data.message;
        _this.showToast(msg);
      } else {
        const userInfo = response.data.response;
        _this.setData({
          nickName: userInfo.nick_name,
          userInfoAvatar: userInfo.avatar,
          sexId: userInfo.sex || 0,
          date: userInfo.birthday || '',
          username: userInfo.true_name || '',
          mobile: userInfo.mobile || '',
          company: userInfo.company || '',
          address: userInfo.address || ''
        });
        switch (userInfo.sex) {
          case 0:
            _this.setData({
              sex: '未知'
            });
            break;
          case 1:
            _this.setData({
              sex: '男'
            });
            break;
          case 2:
            _this.setData({
              sex: '女'
            });
            break;
        }
      }
    });
  },
  chooseimage: function () {  
    const _this = this;
    wx.chooseImage({  
      count: 1, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {  
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        _this.setData({
          userInfoAvatar: res.tempFilePaths[0]
        });
        // 上传图片
        _this.setData({
          hidden: false,
          loadingText: '上传中...'
        });
        wx.uploadFile({
          url: getUri('material_upload'),
          filePath: res.tempFilePaths[0],
          name: 'file',
          success: function(response) {
            if (response.statusCode === 200 && response.data) {
              const data = JSON.parse(response.data);
              if (!data.error) {
                const url = data.response.url;
                _this.setData({
                  uploadImg: url,
                  hidden: true,
                  loadingText: '保存中...'
                });
              } else {
                _this.showToast('上传失败');
                _this.setData({
                  hidden: true,
                  loadingText: '保存中...'
                })
              }
            }
          },
          fail: function(res) {
            console.log(res);
            _this.setData({
              hidden: true,
              loadingText: '保存中...'
            })
          }
        });
      }  
    });  
  }, 
  actionSheetTap: function(e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  actionSheetChange: function(e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  bindSexGetter: function(e) {
    const dataSet = e.target.dataset;
    this.setData({
      sex: dataSet.label,
      sexId: dataSet.id,
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    });
  },
  bindNickNameChange: function (e) {
    this.setData({
      nickName: e.detail.value
    });
  },
  bindUsernameChange: function (e) {
    this.setData({
      username: e.detail.value
    });
  },
  bindMobileChange: function (e) {
    this.setData({
      mobile: e.detail.value
    });
  },
  bindCompanyChange: function (e) {
    this.setData({
      company: e.detail.value
    });
  },
  bindAddressChange: function (e) {
    this.setData({
      address: e.detail.value
    });
  },
  // 反馈提交
  showToast: function (msg, cb) {
    if (this.data.isShowToast) {
      return false;
    }
    this.setData({
      tips: msg,
      isShowToast: true
    });
    setTimeout(function () {
      this.setData({
        isShowToast: false
      });
      cb && cb();
    }.bind(this), this.data.duration);
  },
  validMobile: function() {
    const reg = /^1(3|4|5|7|8)\d{9}$/;
    if (this.data.mobile && reg.test(this.data.mobile) || !this.data.mobile) {
      return true;
    }
    return false;
  },
  saveUserDetail: function() {
    if (!this.data.hidden) {
      return false;
    }
    // 验证手机号码格式是否正确
    if (!this.validMobile()){
      this.showToast('填写正确的手机号');
      return false;
    }
    const params = {
      'avatar': this.data.uploadImg || this.data.userInfoAvatar,
      'nick_name': this.data.nickName,
      'true_name': this.data.username,
      'sex': this.data.sexId,
      'birthday': this.data.date,
      'mobile': this.data.mobile,
      'address': this.data.address,
      'company': this.data.company
    };
    const _this = this;
    _this.setData({
      hidden: false
    })
    api.post(getUri('user_update'), params).then(response => {

      if ('message' in response.data) {
        const err = response.data.error;
        const msg = (err && err == 'error_address') ? '地址不支持表情' : response.data.message ;
        _this.showToast(msg);
      } else {
        _this.showToast("保存成功", ()=>{
          wx.navigateBack({});
        });
      }
      _this.setData({hidden: true});
    });
  },
  modalTap: function(e) {
    var _type = e.currentTarget.dataset.type;
    if (_type in modelType) {
      this.setData({
        changeValue: this.data[_type] || '',
        changeType: _type,
        modalTitle: modelType[_type],
        modalHidden: !this.data.modalHidden
      });
    }
  },
  modalSure: function() {
    const data = {
      modalHidden: true
    };
    data[this.data.changeType] = this.data.changeValue;
    this.setData(data);
  },
  modalCancel: function(e) {
    this.setData({
      modalHidden: true,
    });
  }
};
Page(pageObject);
