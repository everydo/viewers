// 文件的预览方式
var previewCategory={".doc":"flash",".docx":"flash",".ppt":"flash",".pptx":"flash",".pdf":"flash",".rtf":"flash",".wps":"flash",".et":"flash",".dps":"flash",".odt":"flash",".odp":"flash",".ott":"flash",".ots":"flash",".otp":"flash",".vsd":"flash",".vss":"flash",".vst":"flash",".xls":"html",".xlsx":"html",".mht":"html",".html":"html",".htm":"html",".txt":"html",".rst":"html",".xml":"html",".css":"html",".csv":"html",".java":"html",".c":"html",".cpp":"html",".jsp":"html",".asp":"html",".php":"html",".py":"html",".as":"html",".sh":"html",".rar":"RAR",".zip":"RAR",".tar":"RAR",".tgz":"RAR",".gz":"RAR",".mp3":"audio",".wma":"audio",".rm":"audio",".wav":"audio",".mid":"audio",".avi":"video",".rmvb":"video",".rmvb":"video",".mov":"video",".mp4":"video",".swf":"video",".flv":"video",".mpg":"video",".ram":"video",".wmv":"video",".m4v":"video",".3gp":"video",".png":"image",".gif":"image",".jpg":"image",".jpeg":"image",".bmp":"image",".tiff":"image",".ppm":"image",".dwg":"image"};


/****************************************** Ajax *************************************************/

function xmlHttpRequest(n, url, type, identify, serverURL, kwargs, method) {
  if (n > 29) {
    if(type != 'image-exif') {
      document.getElementById(identify).innerHTML = '<span style="color:#666;">转换超时，请刷新后重试...</span>';
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
  xhr.onreadystatechange = function(){callbackFunc(xhr, n, url, type, identify, serverURL, kwargs, method)};
}

function ajaxRequest(n, url, type, identify, serverURL, kwargs, method) {
  if (type != 'image-exif') {
    document.getElementById(identify).innerHTML = '<center><img src="' + serverURL + '/static/loading.gif"><br /><span style="background:#006600;color:#fff;">加载中请稍候...</span></center>';
  }
  var origin = window.location.protocol + '//' + window.location.host;
  // browser IE8 realse support XDomainRequest
  if (navigator.appName == 'Microsoft Internet Explorer' && serverURL.indexOf(origin) == -1) {
    if(type != 'image-exif') {
      document.getElementById(identify).innerHTML = '<center><img src="' + serverURL + '/static/loading.gif"><br /><span style="background:#006600;color:#fff;">转换中请稍候<b>'+(n+1)+'</b>...</span></center>';
    }
    var version = navigator.appVersion.split(";")[1].replace(/ +MSIE +/, '');
    if (version > 8.0 || version == 8.0) {
      if (n > 29) {
        if(type != 'image-exif') {
          document.getElementById(identify).innerHTML = '<span style="color:#666;">转换超时，请刷新后重试...</span>';
          return;
        }
        else
          return;
      }
      var xdr = new XDomainRequest();
      xdr.open('GET', url);
      xdr.onload = function() {
        if (method == 'GET') {
            responseSuccess(xdr, url, type, identify, serverURL, kwargs);
        }
        else if (! hasShow) {
          responseSuccess(xdr, url, type, identify, serverURL, kwargs);
        }
      }
      xdr.onerror = function() {
        var ajaxURL = url.replace(/\&_=.*/, '') + '&_=' + (new Date()).getTime();
        window.setTimeout(ajaxRequest, 3000, n + 1, ajaxURL, type, identify, serverURL, kwargs, method);
        if(type != 'image-exif') {
          document.getElementById(identify).innerHTML = '<center><img src="' + serverURL + '/static/loading.gif"><br /><span style="background:#006600;color:#fff;">转换中请稍候<b>'+(n+1)+'</b>...</span></center>';
        }
      };
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
      xmlHttpRequest(n, url, type, identify, serverURL, kwargs, method);
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
      window.setTimeout(ajaxRequest, 3000, n + 1, ajaxURL, type, identify, serverURL, kwargs, method);
      if (type != 'image-exif') {
        document.getElementById(identify).innerHTML = '<center><img src="' + serverURL + '/static/loading.gif"><br /><span style="background:#006600; color:#fff;">转换中请稍候<b>'+(n+1)+'</b>...</span></center>';
      }
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

// URL 编码进行处理
function encodeURL(url) {
  return encodeURIComponent(url).replace(/\+/g, '%2B');
}

// URL 删除最后斜杠
function removeLastSlash(url) {
  if (url.charAt(url.length-1) == '/') {
    var url = url.substring(0, url.length-1);
  }
  return url;
}

// URL 得到文件后缀
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
    // 浏览器没装FLASH采用HTML预览
    if (swfobject.getFlashPlayerVersion()['major'] < 9) {
        type = 'html';
    }
  }
  return type;
}

/****************************************** END **************************************************/


function edo_viewer(serverURL, sourceURL, identify, width, height, allowPrint, allowCopy) {

  this.serverURL = removeLastSlash(serverURL);
  this.sourceURL = encodeURL(removeLastSlash(sourceURL));
  this.identify = identify;
  this.width = width;
  this.height = height;
  this.allowPrint = allowPrint == 'false' || allowPrint == false ? false : true;
  this.allowCopy = allowCopy == 'false' || allowCopy == false ? false : true;

  this.ext = getExt(sourceURL);
  this.type = getType(ext);
  this.dirMD5 = hex_md5(sourceURL) + ext;

  // FLASH 查看
  if(this.type == 'flash') {
    var kwargs = {
      width: this.width,
      height: this.height,
      allowPrint: this.allowPrint,
      allowCopy: this.allowCopy
    };
    var url = this.serverURL + '/cache/files/' + this.dirMD5 + '/.frs.application_x-shockwave-flash-x/transformed.swf?source=' + this.sourceURL;
    render_flash_viewer(encodeURL(url), this.identify, this.serverURL, kwargs);
  }
  // HTML 查看
  else if (this.type == 'html') {
    var url = this.serverURL + '/cache/files/' + this.dirMD5 + '/.frs.text_html/transformed.html?source=' + this.sourceURL;
    var kwargs = {
      ext: this.ext,
      width: this.width,
      height: this.height
    };
    render_html_viewer(url, this.identify, this.serverURL, kwargs);
  }
  // 压缩包查看
  else if (this.type == 'RAR') {
    var kwargs = {
      ext: this.ext
    };
    var url = this.serverURL + '/cache/files/' + this.dirMD5 + '/.frs.application_json/transformed.json?source=' + this.sourceURL;
    render_zip_viewer(url, this.identify, this.serverURL, kwargs);
  }
  // 音频查看
  else if (this.type == 'audio') {
    var url = serverURL + '/cache/files/' + this.dirMD5 + '/.frs.audio_x-mpeg/transformed.mp3?source=' + this.sourceURL;
    var kwargs = {
      ext: this.ext,
      width: this.width,
      height: this.height
    };
    render_audio_viewer(url, this.identify, this.serverURL, kwargs);
  }
  // 视频查看
  else if (this.type == 'video') {
    var url = this.serverURL + '/cache/files/' + this.dirMD5 + '/.frs.video_x-flv/transformed.flv?source=' + this.sourceURL;
    var kwargs = {
      ext: this.ext,
      width: this.width,
      height: this.height
    };
    render_video_viewer(url, this.identify, this.serverURL, kwargs);
  }
  // 图片查看
  else if (this.type == 'image') {
    var exifURL = this.serverURL + '/cache/files/' + this.dirMD5 + '/.frs.application_exif-x-json/transformed.json?source=' + this.sourceURL;
    var kwargs = {
      ext: this.ext,
      exifURL: exifURL
    };
    var url = serverURL + '/cache/files/' + this.dirMD5 + '/.frs.image_png/image_preview?source=' + this.sourceURL;
    render_image_viewer(url, this.identidy, this.serverURL, kwargs);
  }
  else {
    document.getElementById(this.identify).innerHTML = '该文件的预览方式暂没添加上去！';
  }
}
