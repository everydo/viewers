// 文档预览方式
var previewCategory = {".doc":"flash",".docx":"flash",".ppt":"flash",".pptx":"flash",".pdf":"flash",".rtf":"flash",".wps":"flash",".et":"flash",".dps":"flash",".odt":"flash",".odp":"flash",".ott":"flash",".ots":"flash",".otp":"flash",".vsd":"flash",".vss":"flash",".vst":"flash",".xls":"html",".xlsx":"html",".mht":"html",".html":"html",".htm":"html",".txt":"html",".rst":"html",".xml":"html",".css":"html",".csv":"html",".java":"html",".c":"html",".cpp":"html",".jsp":"html",".asp":"html",".php":"html",".py":"html",".as":"html",".sh":"html",".rar":"RAR",".zip":"RAR",".tar":"RAR",".tgz":"RAR",".gz":"RAR",".mp3":"audio",".wma":"audio",".rm":"audio",".wav":"audio",".mid":"audio",".avi":"video",".rmvb":"video",".rmvb":"video",".mov":"video",".mp4":"video",".swf":"video",".flv":"video",".mpg":"video",".ram":"video",".wmv":"video",".m4v":"video",".3gp":"video",".png":"image",".gif":"image",".jpg":"image",".jpeg":"image",".bmp":"image",".tiff":"image",".ppm":"image",".dwg":"image"};

// 重试次数
var retryCount = 200;
// 间隔时间(秒)
var intervalSecond = 3;

// 文档转换提示
function tipsFunc(serverURL, type, info) {
  if (info == undefined) {
    if (type == 'loading') {
      return '加载中请稍候 <img src="' + serverURL + '/edoviewer/waiting.gif">';
    } else if (type == 'converting') {
      return '转换中请稍候 <img src="' + serverURL + '/edoviewer/waiting.gif">';
    } else {
      return '转换超时，请刷新后重试...';
    }
  } else {
    var re = /^function\s?(.*)/;
    if (info instanceof Function) {
      return info();
    }
    else if (re.test(info)) {
      var func = info.match(re)[1];
      if (func) {
        return eval('info=' + info + ';info();');
      } else {
        return info;
      }
    } else {
      return info;
    }
  }
}

String.prototype.encodeJs = function() {
  var o = [/\\/g, /"/g, /'/g, /\//g, /\r/g, /\n/g, /;/g, /#/g, /\+/g];
  var n = ['\\u005C', '\\u0022', '\\u0027', '\\u002F', '\\u000A', '\\u000D', '\\u003B', '\\u0032', '\\u002B'];
  var s = this;
  for(var i = 0; i < o.length; i++) {
    s = s.replace(o[i] ,n[i]);
  }
  return s;
};
Object.serializeStr = function(obj) {
  if(obj == null) return null;
  if(obj.serializeStr) return obj.serializeStr();
  var cst = obj.constructor;
  switch(cst) {
    case String: return '"' + obj.encodeJs() + '"';
    case Date: return 'new Date(' + obj.getTime() + ')';
    case Array:
      var ar = [];
      for(var i = 0; i < obj.length; i++) ar[i] = Object.serializeStr(obj[i]);
      return '[' + ar.join(',') + ']';
    case Object:
      var ar = [];
      for(var i in obj) {
        ar.push('"' + (i+'').encodeJs() + '":' + Object.serializeStr(obj[i]));
      }
      return '{' + ar.join(',') + '}';
    case Function: return '"' + obj.toString().encodeJs() + '"';
    default:
      return obj;
  }
};

var mobileAccess = /android|iphone|ipod|series60|symbian|windows ce|blackberry/i.test(navigator.userAgent);

/****************************************** Ajax *************************************************/

function xmlHttpRequest(n, url, type, identify, serverURL, kwargs, method) {
  if (n > retryCount - 1) {
    document.getElementById(identify).innerHTML = tipsFunc(serverURL, 'timeout', kwargs.timeout_info);
    return;
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
  xhr.onreadystatechange = function(){callbackFunc(xhr, n, url, type, identify, serverURL, kwargs, method)};
}

function ajaxRequest(n, url, type, identify, serverURL, kwargs, method) {
  if (n == 0) {
    document.getElementById(identify).innerHTML = tipsFunc(serverURL, 'loading', kwargs.loading_info);
  }
  var origin = window.location.protocol + '//' + window.location.host;
  // browser IE8 realse support XDomainRequest
  if (navigator.appName == 'Microsoft Internet Explorer' && serverURL.indexOf(origin) == -1) {
    var version = navigator.appVersion.split(";")[1].replace(/ +MSIE +/, '');
    if (version > 8.0 || version == 8.0) {
      if (n > retryCount - 1) {
        document.getElementById(identify).innerHTML = tipsFunc(serverURL, 'timeout', kwargs.timeout_info);;
        return;
      }
      var xdr = new XDomainRequest();
      xdr.open('GET', url);
      xdr.onload = function() {
        if (method == 'GET') {
          responseSuccess(xdr, url, type, identify, serverURL, kwargs);
        }
        else if (!hasShow) {
          responseSuccess(xdr, url, type, identify, serverURL, kwargs);
        }
      }
      xdr.onerror = function() {
        var ajaxURL = url.replace(/\&_=.*/, '') + '&_=' + (new Date()).getTime();
        window.setTimeout(function(){ajaxRequest(n + 1, ajaxURL, type, identify, serverURL, kwargs, method);}, intervalSecond * 1000);
        document.getElementById(identify).innerHTML = tipsFunc(serverURL, 'converting', kwargs.converting_info);
      }
      var hasShow = false;
      function progres() {
        if (hasShow) { return false; }
        if (method == 'HEAD') {
          responseSuccess(xdr, url, type, identify, serverURL, kwargs);
          hasShow = true;
        }
      }
      xdr.onprogress = progres;
      try {
        xdr.send(null);
      } catch(ex) {}
    } else {
      // IE5.x and IE6 and IE7 browser iframe embedded
      var src = serverURL + '/edo_viewer?kwargs=' + Object.serializeStr(kwargs) + '&url=' + url;
      var iframe = document.createElement('iframe');
      iframe.frameBorder = 0;
      iframe.src = src;
      iframe.width = getParentValue(kwargs.width);
      iframe.height = getParentValue(kwargs.height);
      document.getElementById(identify).innerHTML = '';
      document.getElementById(identify).appendChild(iframe);
    }
  } else {
    xmlHttpRequest(n, url, type, identify, serverURL, kwargs, method);
  }
}

function callbackFunc(xmlHttp, n, url, type, identify, serverURL, kwargs, method) {
  if (xmlHttp.readyState == 4) {
    if (xmlHttp.status == 200) {
      var url = url.replace(/\&_=.*/, '');
      responseSuccess(xmlHttp, url, type, identify, serverURL, kwargs);
    }
    else if (xmlHttp.status == 404 || xmlHttp.status == 0) {
      var ajaxURL = url.replace(/\&_=.*/, '') + '&_=' + (new Date()).getTime();
      window.setTimeout(function(){ajaxRequest(n + 1, ajaxURL, type, identify, serverURL, kwargs, method);}, intervalSecond * 1000);
      document.getElementById(identify).innerHTML = tipsFunc(serverURL, 'converting', kwargs.converting_info);
    }
    else {
      document.getElementById(identify).innerHTML = "Error: status code is " + xmlHttp.status;
    }
  }
}

function responseSuccess(xmlHttp, url, type, identify, serverURL, kwargs) {
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
    if (swfobject.getFlashPlayerVersion()['major'] < 9 || mobileAccess) {
      type = 'html';
    }
  }
  return type;
}

// 得到预览地址
function getURL(type, serverURL, dirMD5, sourceURL, kwargs) {
  var patterns = {
    'flash': 'application_x-shockwave-flash-x',
    'html': 'text_html',
    'RAR': 'application_json',
    'audio': 'audio_x-mpeg',
    'video': 'video_x-flv',
    'image': 'image_png',
    'image-exif': 'application_exif-x-json'
  }
  var pattern = patterns[type];
  if (pattern == undefined) {
    return;
  } else {
    var location = kwargs.location || ''
      ,ip = kwargs.ip || ''
      ,timestamp = kwargs.timestamp || ''
      ,app_id = kwargs.app_id || ''
      ,account = kwargs.account || ''
      ,username = kwargs.username || ''
      ,download_source = kwargs.download_source || ''
      ,signcode = kwargs.signcode || ''

    var paramsObject = {
      mime: pattern,
      source: sourceURL,
      ip: ip,
      timestamp: timestamp,
      app_id: app_id,
      account: account,
      username: username,
      download_source: download_source,
      signcode: signcode,
    }

    var paramsStr = '';
    for (var key in paramsObject) {
      if (!paramsObject[key]) {
        continue
      }

      if (paramsStr != '') {
        paramsStr += '&';
      }
      paramsStr += key + '=' + paramsObject[key];
    }

    if (location) {
      paramsStr += '&location=' + location;
    } else {
      paramsStr += '&location=' + '/files/' + dirMD5;
    }

    var url = serverURL + '/download?' + paramsStr;
    if (type == 'image') {
      url += '&subfile=image_large'
    }
    return url;
  }
}

// 得到父高宽值
function getParentValue(value) {
  if (value == undefined) {
    value = 700;
  } else if (/px$/i.test(value)) {
    value = value.replace(/px/i, '') + 50 + 'px';
  } else if (/em$/i.test(value)) {
    value = value.replace(/em/i, '') + 5 + 'em';
  } else if (/\d$/.test(value)) {
    value = value + 50;
  } else if (/%$/.test(value)) {
    value = '100%';
  }
  return value;
}

/****************************************** END **************************************************/


/****************************************** API **************************************************/

var EdoViewer = {

  createViewer: function (identify, kwargs) {
    var serverURL = kwargs.server_url
       ,sourceURL = kwargs.source_url
        ,location = kwargs.location;

    if (!(serverURL || sourceURL)) {
      return false;
    }

    var ext = getExt(location || sourceURL)
      ,type = getType(ext)
    ,dirMD5 = hex_md5(sourceURL) + ext;

    if (type) {
      kwargs['ext'] = ext;
      var url = getURL(type, serverURL, dirMD5, sourceURL, kwargs);
    }

    function renderViewer () {
      if(type == 'flash') {
        render_flash_viewer(encodeURL(url), identify, serverURL, kwargs);
      }
      else if (type == 'html') {
        render_html_viewer(url, identify, serverURL, kwargs);
      }
      else if (type == 'RAR') {
        render_zip_viewer(url, identify, serverURL, kwargs);
      }
      else if (type == 'audio') {
        render_audio_viewer(url, identify, serverURL, kwargs);
      }
      else if (type == 'video') {
        render_video_viewer(url, identify, serverURL, kwargs);
      }
      else if (type == 'image') {
        var exifURL = getURL('image-exif', serverURL, dirMD5, sourceURL, kwargs);
        kwargs['exifURL'] = exifURL;
        render_image_viewer(url, identify, serverURL, kwargs);
      } else {
        document.getElementById(identify).innerHTML = '该文件的预览方式暂没添加上去！';
      }
      return false;
    }

    var viewer = {
      load: function () {
        return renderViewer();
      }
    }
    return viewer;
  }

  ,load: function () {
    return viewer.load();
  }
}

/****************************************** END **************************************************/
