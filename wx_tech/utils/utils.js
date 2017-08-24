/**
 * [utils description]
 * @type {Object}
 */

export const utils = {
  createImgSrc: ( data, options ) => {
    var src, op_str = '';
    options.orient = 1;
    if( options.orient ){
      op_str = '?imageMogr2/auto-orient'
    }
    if( options.width || options.height ){
      op_str += '/thumbnail/';
      if( options.width && options.height ){
        op_str += ('!' + options.width + 'x' + options.height + 'r');
      } else if (options.width){
        op_str += (options.width + 'x')
      } else {
        op_str += ('x' + options.width)
      }
    }
    src = [data.host, data.file, op_str].join('');
    return src;
  },
  replaceRichText: ( str ) => {
   	str = str.replace(/<section(.*?)>/g, function(string, key){
        return string.replace(string, '<div' + key + '>')
      })
     .replace(/<img(.*?)\/>/g, function(string, key){
        return string.replace(string, '<img class="richImg"' + key + '>')
      })
	.replace(/<\/section>/g, '<\/div>');
	return str;
  }
}
