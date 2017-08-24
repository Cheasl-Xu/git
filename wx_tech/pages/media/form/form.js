import { utils } from '../../../utils/utils.js'

var api = require('../../../utils/api.js'),
    config = require('../../../utils/config.js');

var app = getApp()
Page({
    data: {
        id:'',
        Audioform:{},
        errorTip:"",
        count:{
            page:1,
            size:5
        },
        commentlist:[],
        commentreply:{},
        isPraise:true,
        focus:false,
        inputContent:{},
        fid:'',
        commentArr:[],
    },
    onLoad: function (e) {
        var that = this;
        that.setData({
            id:e.id
        })
        this.getAudioform()
        this.getCommentlist()
    },
    getAudioform: function(){
        var that = this;
        utils.http(config.getUri('content_detail', 'tech').replace('{id}', that.data.id),{
        },{
            success: function(res){
                if(res.statusCode == 200){
                    var data = res.data;
                    if(data.error || data.message){
                        that.data.errorTip = data.message || data.error || '访问错误';
                        that.setData({
                            errorTip: that.data.errorTip
                        })
                    }else{
                        if(data.response.data.indexpic){
                            data.response.data.indeximg = utils.createImgSrc(data.response.data.indexpic , {width: 200})
                        }
                        that.setData({
                            Audioform:data.response.data
                        })
                    }
                }
            },
            fail: function(data){
                console.log(data)
            }
        })
    },
    getCommentlist: function(){
        var that = this;
        utils.http(config.getUri('comment_lists','tech'),{
            page: that.data.count.page,
            count: that.data.count.size,
            content_id: that.data.id,
            order: ''
        },{
            success: function(res){
                if(res.statusCode == 200){
                    var data = res.data;
                    if(data.error || data.message){
                        that.data.errorTip = data.message || data.error || '访问错误';
                        that.setData({
                            errorTip: that.data.errorTip
                        })
                    }else{
                        that.setData({
                            commentlist: data.response.data
                        })
                        that.setData({
                            commentreply: data.response.data.reply
                        })
                    }
                }
            },
            fail: function(data){
                console.log(data)
            }
        })
    },
    praise: function(event){
        var that = this;
        utils.http(config.getUri('comment_praise','tech'),{
            comment_id: event.currentTarget.dataset.id
        },{
            success: function(res){
                if(res.statusCode == 200){
                    var data = res.data;
                    if(data.error || data.message){
                        that.data.errorTip = data.message || data.error || '访问错误';
                        that.setData({
                            errorTip: that.data.errorTip
                        })
                    }else{
                        if(data.response.success == 1){
                            if(that.data.isPraise == true){
                                that.setData({
                                    isPraise: false
                                })
                            }else{
                                that.setData({
                                    isPraise: true
                                })
                            }
                        }
                    }
                }
            },
            fail: function(data){
                console.log(data)
            }
        })
    },
    input_content: function(event){
        var that = this;
        that.setData({
            focus: true
        })
        that.setData({
           fid: event.currentTarget.dataset.fid 
        })
    },
    bindChange: function(e){
        var that = this;
        that.setData({
            inputContent: e.detail.value
        })
    },
    comment_submit: function(){
        var that = this;
        var params = {
            content_id: that.data.id,
            content_type: 'audio',
            content:that.data.inputContent,
            fid: that.data.fid
        }
        utils.http(config.getUri('comment_add','tech'),params,{method : 'post'} ,{
            success: function(res){
                console.log(res)
                if(res.statusCode == 200){
                    var data = res.data;
                    if(data.error || data.message){
                        console.log(888)
                        that.data.errorTip = data.message || data.error || '访问错误';
                        that.setData({
                            errorTip: that.data.errorTip
                        })
                    }else{
                        // that.setData({
                        //     commentlist:data.response.data
                        // })
                        console.log(data,890)
                        that.data.commentlist.unshift(data.response.data)
                        console.log(that.data.commentlist,1111)
                    }
                }
            },
            fail: function(data){
                console.log(data)
            }
        })
    }
})
