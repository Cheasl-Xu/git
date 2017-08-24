/* eslint-disable */
const constant = {
  ports: {
    tech: {
        "session_key": "/h5/client/applet/token", // 获取session_key
        "app_login": "/h5/client/applet",         // 登录
        "notice_lists": "/h5/notice/lists",
        "unread_msg": "/h5/notice/unread/number",  // 未读通知数量
        "interact_lists": "/h5/notice/interact",
        "system_lists": "/h5/notice/lists",
        "material_upload": "/material/uploads",   // 头像上传

        "user_detail": "/h5/user/detail",
        "user_update": "/h5/user/update",
        
        "nav_lists": "/h5/shop/navigation/lists",
        "banner_lists":"/h5/banner/lists",
        
        "alive_list": "/h5/alive/message/lists", // 直播消息列表
        "alive_lists": "/h5/content/alive/lists",
        
        "column_detail":"/h5/content/column/detail/{id}",
        "column_contents": "/h5/content/column/contents",
        "column_free_detail":"/h5/content/free/column/detail/{id}",
        "column_lists": '/h5/content/column/lists',
        "column_subscribe": '/h5/content/user/subscribe',
        
        "content_free_detail":"/h5/content/free/detail/{id}",
        "content_detail":"/h5/content/detail/{id}",
        "content_lists": "/h5/content/lists",
        
        "comment_lists": "/h5/comment/lists",
        "comment_add": "/h5/comment/add",
        "comment_praise": "/h5/comment/praise",
        "comment_delete": "/h5/comment/delete",
        
        "cos_signature": '/cos/signature',
        
        "feedback_add": "/h5/feedback/add",
        
        "order_lists": "/h5/order/lists",
        "user_order": "/h5/content/user/column",
        "order_make": "/h5/order/make",
        
        "h5_pay": "/h5/pay/{type}/{id}",
        
        "gift_lists": "/h5/gift/lists",
        "share_lists": "/h5/share/{code}",
        "share_get": "/h5/share/get/{code}",
        "shop_share": "/h5/shop/share",
        "share_back": "/h5/share/callback",

        "invite_code": "/h5/share/{code}",
        "gift_word": "/h5/gift/word", 
        
        "message_send": "/h5/alive/message/send",
        "message_revoke":"/h5/alive/message/revoke", // 直播消息撤回
        "message_gag": "/h5/alive/message/gag", // 禁言接口
        "alive_manage": "/h5/alive/manage", // 管理模式
        "alive_round_list": "/h5/alive/round/lists", // 直播消息列表
        "message_del": "/h5/alive/message/delete", // 消息删除
        "material_list": "/h5/material/lists", //素材列表
        "material_save": "/h5/material/save",  // 新增素材
        "material_delete": "/h5/material/delete", //删除素材
        "material_update": "/h5/material/update", //更新素材
        "material_detail": "/h5/material/detail",  // 素材详情
        "upload_material": "/h5/material/upload", // 微信上传转换接口
        "online_person": "/h5/alive/online/people", // 在线人数统计接口
        "online_count": "/h5/alive/online/count",    // 在线人数接口
        "cancel_end": "/h5/alive/end", // 结束直播
        "alive_pattern": "/h5/alive/pattern" // 直播模式接口
    }
  }
};


// constant.host = 'http://api.tech.test.xiuzan.com';
constant.host = 'https://api.duanshu.com';

export const getUri = (key, sign) => {
  sign = sign || 'tech';
  if (!constant.ports[sign] || !constant.ports[sign][key] ) {
  return false;
  }
  return constant.host + constant.ports[sign][key];
};
