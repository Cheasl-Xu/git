import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';
import { utils } from '../../utils/utils.js';
import { shoppingData } from '../../config/shopping.js';

var app = getApp();
Page({
    data: {
        id:'',
        type:'',
        errorTip:'',
        formDetail: {},
        count:{
            page:1,
            size:5,
            num:'',
            sum:''
        },
        commentlist:[],
        hotlist:[],
        hotComment:false,
        isPraise:true,
        focus:false,
        inputContent:'',
        noComment:false,
        fid:'',
        isMore:false,
        commentTotal:'',
        inputName:'',
        placeholder:'说说你的意见吧',
        loadding:true,
        index:0,
      	isShowToast: false,
        tips: '',
    	duration: 1500,
    	h5_qrcode: shoppingData.h5QRcode,
        height:'',
        hasMore:false,
        canIUse: wx.canIUse('rich-text.nodes'),
        footer:false
    },
    onLoad: function (e) {
        var that = this;
        if(!e.cid || !e.type){
            that.setData({
                errorTip: '链接错误'
            })
            return false
        }
        app.getSystemInfo(function(res) {
            that.setData({
                height: res.windowHeight-114
            })
        })
        that.setData({
            id:e.cid,
            type:e.type
        })
        app.check(function(){
			that.getformDetail()
        })
        if(this.data.type == 'audio'){
        	this.audioCtx = wx.createAudioContext('myAudio');
    		this.audioCtx.play()
        }
    },
    onPullDownRefresh : function(){
        this.data.count.page=1;
        this.getformDetail('refresh')
      
    },
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
    onShareAppMessage() {
  		var that = this;
    	return {
      		title: that.data.formDetail.title,
      		path: '/pages/form/form?cid='+that.data.id+'&type='+this.data.type
		}
  	},
    getformDetail: function(type){
        var that = this;
        if(!type){
            that.setData({
                loadding: true
            })
        }else{
            that.setData({
                loadding: false
            })
        }
        api.get(getUri('content_detail', 'tech').replace('{id}', that.data.id),{}).then(res => {
            if(res.statusCode == 200){
                var data = res.data;
                wx.stopPullDownRefresh();
                if(data.error || data.message){
                	if(data.error == "no-pay" ){
                		that.setData({
		                    errorTip: 'no-pay'
		                })
                	}else{
	                	 wx.redirectTo({
	                        url:'/pages/error/error',
	                    })	
                	}
                }else if(data.response.data && data.response.data.title){
                    this.getCommentlist('hot')
                    this.getCommentlist()
                    if(data.response.data.indexpic){
                        data.response.data.indeximg = utils.createImgSrc(data.response.data.indexpic , {width: 750})
                    }
                    wx.setNavigationBarTitle({  title: data.response.data.title })
                    if(that.data.canIUse){
						data.response.data.content = utils.replaceRichText(data.response.data.content);
					}else{
						data.response.data.content = data.response.data.content.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,'');
                        data.response.data.brief = data.response.data.brief.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,'');
					}
                    
                    that.setData({
                        formDetail: data.response.data
                    })
                }
            }
            that.setData({
                loadding: false
            });
        }).catch(res => {
        	 wx.stopPullDownRefresh();
            that.setData({
                loadding: false
            })
             wx.redirectTo({
                url:'/pages/error/error',
            })	
        })
    },
    getCommentlist: function(type){
        var that = this;
        var param ={
            page: that.data.count.page,
            count: that.data.count.size,
            content_id: that.data.id,
            order: type ? type : ''
        }
        api.get(getUri('comment_lists','tech'),param).then(res => {
            if(res.statusCode == 200){
                var data = res.data;
                if(data.error || data.message){
                    this.showToast( data.message || data.error);
                    return false;
                }else if(data.response.data && data.response.data[0]){
                    var page = data.response.page
                    if(type != 'hot'){
                        that.data.commentTotal = page.total
                        that.setData({
                            commentTotal:that.data.commentTotal
                        })
                        if(page.current_page < page.last_page){
                            
                            that.setData({
                                isMore:true
                            })
                        }else{
                            that.setData({
                                isMore:false
                            })
                        }
                    }
                    that.data.count.num = page.last_page
                    if(data.response.data.indexpic){
                        data.response.data.indeximg = utils.createImgSrc(data.response.data.indexpic , {width: 80})
                    }
                    for(var i = 0 ;i<data.response.data.length; i++){
                        //点赞状态
                        data.response.data[i].isPraise = true;
                        if(data.response.data[i].praise_status == 1){
                            data.response.data[i].isPraise = false;
                        }
                        //删除状态
                        if(data.response.data[i].fid != 0 && !data.response.data[i].reply[0]){
                            data.response.data[i].commentdelete = true
                        }
                    }
                    if(type != 'hot'){
                        that.data.commentlist = that.data.commentlist.concat(data.response.data)
                        that.setData({
                            commentlist: that.data.commentlist,
                            noComment: true
                        })
                    }else{
                        that.data.hotlist = data.response.data
                        that.setData({
                            hotlist: that.data.hotlist,
                            hotComment:true
                        })
                    }
                }else{
                    that.setData({
                        noComment: false,
                        hotComment:false
                    })
                }
            }
        }).catch(res => {
            console.log(res)
        })
    },
    praise: function(event){
        var that = this,
            id = event.currentTarget.dataset.id;
        var param ={
            comment_id: id
        }
        api.get(getUri('comment_praise','tech'),param).then(res => {
            if(res.statusCode == 200){
                var data = res.data;
                if(data.response.success == 1){
                    for(let k1 in that.data.commentlist){
                        var comm = that.data.commentlist[k1]
                        if(comm.id == id){
                            comm.isPraise = !comm.isPraise
                            if(comm.isPraise == true){
                                comm.praise--
                                if(comm.praise < 0){
                                    comm.praise = 0
                                }
                            }else{
                                comm.praise++
                            }
                        }
                    }

                    for(let k2 in that.data.hotlist){
                        var hot = that.data.hotlist[k2]
                        if(hot.id == id){
                            hot.isPraise = !hot.isPraise
                            if(hot.isPraise == true){
                                hot.praise--
                                if(hot.praise < 0){
                                    hot.praise = 0
                                }
                            }else{
                                comm.praise++
                            }
                        }
                    }
                    that.setData({
                        commentlist:that.data.commentlist,
                        hotlist:that.data.hotlist
                    })
                }
            }
        }).catch(res => {
            console.log(res)
        })
    },
    input_content: function(event){
        var that = this;
        that.data.fid = event.currentTarget.dataset.fid
        that.data.inputName = event.currentTarget.dataset.name
        that.data.index = event.currentTarget.dataset.index
        that.setData({
            focus: true
        })
        that.setData({
           fid: that.data.fid,
           placeholder:'回复:' + that.data.inputName
        })
    },
    comment_submit: function(e){
        var that = this;
        var param = {
            content_id: that.data.id,
            content_type: that.data.type,
            content:e.detail.value.input,
            fid: that.data.fid
        }
        api.post(getUri('comment_add','tech'),param).then(res => {
            if(res.statusCode == 200){
                var data = res.data;
                if(data.error || data.message){
                    this.showToast( data.message || '评论失败');
                    return false;
                }else{
                    that.data.commentTotal++
                    that.data.count.num = that.data.count.num ? that.data.count.num : 1;
                    data.response.data.praise = 0;
                    that.setData({
                        commentTotal:that.data.commentTotal
                    })
                    if(!that.data.fid || that.data.commentlist[that.data.index].id == that.data.fid){
                        data.response.data.mine = 1
                    }
                    data.response.data.just = '刚刚'
                    data.response.data.isPraise = true;
                    that.data.commentlist.unshift(data.response.data)
                    that.setData({
                        commentlist:that.data.commentlist,
                        inputContent: '',
                        placeholder:'说说你的意见吧',
                        noComment:true,
                        fid:''
                    })
                    this.showToast('评论成功!');
                }
            }
        }).catch(res => {
           this.showToast('评论失败');
            return false;
        })
    },
    commentDelete: function(event){
        var that = this,
        	id = event.currentTarget.dataset.id,
        	type = event.currentTarget.dataset.type;
        
        var param = {
            content_id:that.data.id,
            id:id
        }
        api.get(getUri('comment_delete', 'tech'),param).then(res => {
            if(res.statusCode == 200){
            	var data = res.data;
                if(data.error || data.message){
    		  		this.showToast( data.message || '删除失败');
    		  		return false;
            	}else{
                    this.showToast('删除成功',function(){
    	            	for(let key in that.data.commentlist){
    	            	 	var comm = that.data.commentlist[key];
    	            	 	if(comm.id == id){
    	            	 		that.data.commentlist.splice(key,1);
    	            	 	}
    	            	 	if(comm.fid == id){
    	            	 		comm.reply = [];
    	            	 		comm.commentdelete = true;
    	            	 	}
    	            	}
    	            	for(let kk in that.data.hotlist){
    	            	 	var hot = that.data.hotlist[kk];
    	            	 	if(hot.id == id){
    	            	 		that.data.hotlist.splice(kk,1);
    	            	 	}
    	            	 	if(hot.fid == id){
    	            	 		hot.reply = [];
    	            	 		hot.commentdelete = true;
    	            	 	}
    	            	}
    	            	
    	                that.data.commentTotal--
    	                that.setData({
    	                    commentTotal:that.data.commentTotal,
    	                    commentlist:that.data.commentlist,
    	                    hotlist:that.data.hotlist
    	                })
                    });
            	}
            }
        })
    },
    loadMore(){
        var that = this;
        
        if(!that.data.count.num || that.data.count.page == that.data.count.num){
            return false;
            that.setData({
                footer:true
            })
        }
        that.data.count.page++;
        that.setData({
            hasMore: true,
            count: that.data.count
        });
        
        that.getCommentlist()
    },
    downloadFile: function(){
    	var _this = this;
    	wx.showActionSheet({
		  itemList: ['保存图片'],
		  success: function(res) {
		  	if(res.tapIndex == 0){
	  			app.downloadFile(_this.data.h5_qrcode);
		  	}
		  },
		  fail: function(res) {
		    console.log(res.errMsg)
		  }
		})
    }

})
