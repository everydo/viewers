// 文档预览方式
var previewCategory = {".doc":"flash",".docx":"flash",".ppt":"flash",".pptx":"flash",".pdf":"flash",".rtf":"flash",".wps":"flash",".et":"flash",".dps":"flash",".odt":"flash",".odp":"flash",".ott":"flash",".ots":"flash",".otp":"flash",".vsd":"flash",".vss":"flash",".vst":"flash",".xls":"html",".xlsx":"html",".mht":"html",".html":"html",".htm":"html",".txt":"html",".rst":"html",".xml":"html",".css":"html",".csv":"html",".java":"html",".c":"html",".cpp":"html",".jsp":"html",".asp":"html",".php":"html",".py":"html",".as":"html",".sh":"html",".rar":"RAR",".zip":"RAR",".tar":"RAR",".tgz":"RAR",".gz":"RAR",".mp3":"audio",".wma":"audio",".rm":"audio",".wav":"audio",".mid":"audio",".avi":"video",".rmvb":"video",".rmvb":"video",".mov":"video",".mp4":"video",".swf":"video",".flv":"video",".mpg":"video",".ram":"video",".wmv":"video",".m4v":"video",".3gp":"video",".png":"image",".gif":"image",".jpg":"image",".jpeg":"image",".bmp":"image",".tiff":"image",".ppm":"image",".dwg":"image"};

// 重试次数
var retryCount = 200;
// 间隔时间(秒)
var intervalSecond = 3;

// 文档转换提示
var timeoutError = '转换超时，请刷新后重试...';
var loadingFunc = function(serverURL){return '加载中请稍候 <img src="' + serverURL + '/static/loading.gif">';}
var conversionFunc = function(serverURL, n){return '转换中请稍候' + (n + 1) + '/' + retryCount + ' <img src="' + serverURL + '/static/loading.gif">';}

/****************************************** Ajax *************************************************/

function xmlHttpRequest(n, url, type, identify, serverURL, kwargs, method, onlyRequest) {
  if (n > retryCount - 1) {
    if(onlyRequest != true) {
      document.getElementById(identify).innerHTML = timeoutError;
      return;
    } else {
      return;
    }
  }
  var xhr = null;
  if (window.XMLHttpRequest) {
    // If IE7, Mozilla, Safari, and so on: Use native object.
    xhr = new XMLHttpRequest();
  } else {
    if (window.ActiveXObject) {
      // ...otherwise, use the ActiveX control for IE5.x and IE6.
      xhr = new ActiveXObject('MSXML2.XMLHTTP.3.0');
    }
  }
  if (!xhr) {
    document.getElementById(identify).innerHTML = "Error initializing XMLHttpRequest!";
    return;
  }
  xhr.open(method, url, true);
  xhr.send(null);
  xhr.onreadystatechange = function(){callbackFunc(xhr, n, url, type, identify, serverURL, kwargs, method, onlyRequest)};
}

function ajaxRequest(n, url, type, identify, serverURL, kwargs, method, onlyRequest) {
  if (onlyRequest != true) {
    document.getElementById(identify).innerHTML = loadingFunc(serverURL);
  }
  var origin = window.location.protocol + '//' + window.location.host;
  // browser IE8 realse support XDomainRequest
  if (navigator.appName == 'Microsoft Internet Explorer' && serverURL.indexOf(origin) == -1) {
    if(onlyRequest != true) {
      document.getElementById(identify).innerHTML = conversionFunc(serverURL, n);
    }
    var version = navigator.appVersion.split(";")[1].replace(/ +MSIE +/, '');
    if (version > 8.0 || version == 8.0) {
      if (n > retryCount - 1) {
        if(onlyRequest != true) {
          document.getElementById(identify).innerHTML = timeoutError;
          return;
        }
        else
          return;
      }
      var xdr = new XDomainRequest();
      xdr.open('GET', url);
      xdr.onload = function() {
        if (method == 'GET') {
          responseSuccess(xdr, url, type, identify, serverURL, kwargs, onlyRequest);
        }
        else if (!hasShow) {
          responseSuccess(xdr, url, type, identify, serverURL, kwargs, onlyRequest);
        }
      }
      xdr.onerror = function() {
        var ajaxURL = url.replace(/\&_=.*/, '') + '&_=' + (new Date()).getTime();
        window.setTimeout(function(){ajaxRequest(n + 1, ajaxURL, type, identify, serverURL, kwargs, method, onlyRequest);}, intervalSecond * 1000);
        if(onlyRequest != true) {
          document.getElementById(identify).innerHTML = conversionFunc(serverURL, n);
        }
      };
      var hasShow = false;
      function progres() {
        if (hasShow) { return false; }
        if (method == 'HEAD') {
          responseSuccess(xdr, url, type, identify, serverURL, kwargs, onlyRequest);
          hasShow = true;
        }
      }
      xdr.onprogress = progres;
      try {
          xdr.send(null);
      } catch(ex) {}
    } else {
      xmlHttpRequest(n, url, type, identify, serverURL, kwargs, method, onlyRequest);
    }
  } else {
    xmlHttpRequest(n, url, type, identify, serverURL, kwargs, method, onlyRequest);
  }
}

function callbackFunc(xmlHttp, n, url, type, identify, serverURL, kwargs, method, onlyRequest) {
  if (xmlHttp.readyState == 4) {
    if (xmlHttp.status == 200) {
      var url = url.replace(/\&_=.*/, '');
      responseSuccess(xmlHttp, url, type, identify, serverURL, kwargs, onlyRequest);
    }
    else if (xmlHttp.status == 404 || xmlHttp.status == 0) {
      var ajaxURL = url.replace(/\&_=.*/, '') + '&_=' + (new Date()).getTime();
      window.setTimeout(function(){ajaxRequest(n + 1, ajaxURL, type, identify, serverURL, kwargs, method, onlyRequest);}, intervalSecond * 1000);
      if (onlyRequest != true) {
        document.getElementById(identify).innerHTML = conversionFunc(serverURL, n);
      }
    }
    else {
      document.getElementById(identify).innerHTML = "Error: status code is " + xmlHttp.status;
    }
  }
}

function responseSuccess(xmlHttp, url, type, identify, serverURL, kwargs, onlyRequest) {
  if (onlyRequest == true && !type) {
    return;
  }

  kwargs['callback'] = true;
  if (type == 'html') {
    render_html_viewer(url, identify, serverURL, kwargs);
  }
  else if (type == 'RAR') {
    kwargs['data'] = eval('(' + xmlHttp.responseText + ')');
    render_zip_viewer(url, identify, serverURL, kwargs);
  }
  else if (type == 'audio') {
    render_audio_viewer(url, identify, serverURL, kwargs);
  }
  else if (type == 'video') {
   render_video_viewer(url, identify, serverURL, kwargs);
  }
  else if (type == 'image') {
    render_image_viewer(url, identify, serverURL, kwargs);
  }
  else if (type == 'image-exif') {
    kwargs['data'] = eval('(' + xmlHttp.responseText + ')');
    render_exif_viewer(url, identify, serverURL, kwargs);
  }
}

/****************************************** END **************************************************/


/**************************************** 公共方法 ***********************************************/

// 进行编码处理
function encodeURL(url) {
  return encodeURIComponent(url).replace(/\+/g, '%2B');
}

// 删除最后斜杠
function removeLastSlash(url) {
  if (url.charAt(url.length-1) == '/') {
    var url = url.substring(0, url.length-1);
  }
  return url;
}

// 得到文件后缀
function getExt(url) {
  var splitURL = url.split('/');
  var endChar = url.split('/').reverse();
  if (!endChar[0]) {
    endChar = endChar[1];
  } else {
    endChar = endChar[0];
  }

  if (endChar.indexOf('?') == -1) {
    var ext = ('.' + endChar.split('.')[endChar.split('.').length-1]).toLowerCase();
  } else {
    var splitExt = (endChar.split('.')[endChar.split('.').length-1]).split('?');
    var ext = ('.' + splitExt[0]).toLowerCase();
  }
  return ext;
}

// 得到预览类型
function getType(ext) {
  var type = previewCategory[ext];
  if (type == 'flash') {
    var mobileAccess = /android|iphone|ipod|series60|symbian|windows ce|blackberry/i.test(navigator.userAgent);
    if (swfobject.getFlashPlayerVersion()['major'] < 9 || mobileAccess) {
      type = 'html';
    }
  }
  return type;
}

// 得到预览地址
function getURL(type, serverURL, dirMD5, sourceURL) {
  var patterns = {
    'flash': '.frs.application_x-shockwave-flash-x/transformed.swf',
    'html': '.frs.text_html/transformed.html',
    'RAR': '.frs.application_json/transformed.json',
    'audio': '.frs.audio_x-mpeg/transformed.mp3',
    'video': '.frs.video_x-flv/transformed.flv',
    'image': '.frs.image_png/image_large',
    'image-exif': '.frs.application_exif-x-json/transformed.json'
  }
  var pattern = patterns[type];
  if (pattern == undefined) {
    return;
  } else {
    var url = serverURL + '/cache/files/' + dirMD5 + '/' + pattern  + '?source=' + sourceURL;
    return url;
  }
}

/****************************************** END **************************************************/


/****************************************** API **************************************************/

function edo_viewer(serverURL, sourceURL, identify, kwargs) {
  var ext = getExt(sourceURL);
  var type = getType(ext);
  var dirMD5 = hex_md5(sourceURL) + ext;

  if (typeof(kwargs) != typeof({})) { var kwargs = {}; }

  var serverURL = removeLastSlash(serverURL);
  var sourceURL = encodeURL(removeLastSlash(sourceURL));

  if (type == undefined) {
    document.getElementById(identify).innerHTML = '该文件的预览方式暂没添加上去！';
    return;
  } else {
    kwargs['ext'] = ext;
    var url = getURL(type, serverURL, dirMD5, sourceURL);
  }

  // FLASH 查看
  if(type == 'flash') {
    render_flash_viewer(encodeURL(url), identify, serverURL, kwargs);
  }
  // HTML 查看
  else if (type == 'html') {
    render_html_viewer(url, identify, serverURL, kwargs);
  }
  // 压缩包查看
  else if (type == 'RAR') {
    render_zip_viewer(url, identify, serverURL, kwargs);
  }
  // 音频查看
  else if (type == 'audio') {
    render_audio_viewer(url, identify, serverURL, kwargs);
  }
  // 视频查看
  else if (type == 'video') {
    render_video_viewer(url, identify, serverURL, kwargs);
  }
  // 图片查看
  else if (type == 'image') {
    var exifURL = getURL('image-exif', serverURL, dirMD5, sourceURL);
    kwargs['exifURL'] = exifURL;
    render_image_viewer(url, identify, serverURL, kwargs);
  }
}

function prepare_for_view(sourceURL, serverURL) {
  var ext = getExt(sourceURL);
  var type = getType(ext);
  var dirMD5 = hex_md5(sourceURL) + ext;

  var serverURL = removeLastSlash(serverURL);
  var sourceURL = encodeURL(removeLastSlash(sourceURL));

  var start = retryCount - 1;
  var items = new Array();

  if (type == undefined) {
    return;
  } else {
    var url = getURL(type, serverURL, dirMD5, sourceURL);
    items.push(url);
  }

  if(type == 'flash') {
    var htmlURL = getURL('html', serverURL, dirMD5, sourceURL);
    items.push(htmlURL);
  }
  else if (ext== '.jpg' || ext == '.jpeg' || ext == '.tiff') {
    var exifURL = getURL('image-exif', serverURL, dirMD5, sourceURL);
    items.push(exifURL);
  }

  for (var x = 0; x < items.length; x ++) {
    ajaxRequest(start, items[x], null, null, serverURL, null, 'HEAD', true);
  }
}

/****************************************** end **************************************************/
