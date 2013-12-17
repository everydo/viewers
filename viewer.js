// 压缩包内能预览的文件后缀
var supportExt = {doc:!0,docx:!0,xls:!0,xlsx:!0,ppt:!0,pps:!0,pos:!0,pptx:!0,rtf:!0,wps:!0,et:!0,dps:!0,odt:!0,odp:!0,ott:!0,ots:!0,otp:!0,mht:!0,html:!0,htm:!0,txt:!0,rst:!0,xml:!0,css:!0,csv:!0,java:!0,c:!0,cpp:!0,jsp:!0,asp:!0,php:!0,py:!0,as:!0,sh:!0,png:!0,gif:!0,jpg:!0,jpeg:!0,bmp:!0,tiff:!0,ppm:!0,dwg:!0,mp3:!0,wma:!0,rm:!0,wav:!0,mid:!0,avi:!0,rmvb:!0,rmvb:!0,mov:!0,mp4:!0,swf:!0,flv:!0,mpg:!0,ram:!0,wmv:!0,m4v:!0,"3gp":!0,rar:!0,zip:!0,tar:!0,tgz:!0,gz:!0,pdf:!0};

// EXIF 翻译
var exifTranslate = {XResolution:"影像水平分辨率",YResolution:"影像垂直分辨率",ResolutionUnit:"分辨率单位",Orientation:"方向",ExifOffset:"Exif信息位置",ColorSpace:"影像色域空间",DateTime:"文件修改时间",ExposureTime:"曝光时间",FNumber:"光圈值",ISOSpeedRatings:"ISO速度",CompressedBitsPerPixel:"影像压缩模式",ExposureBiasValue:"曝光补偿",ExposureBiasValue:"最大光圈",MeteringMode:"测光模式",LightSource:"光源",Flash:"闪光灯",FocalLength:"焦距",FlashpixVersion:"支持位图的版本",PixelXDimension:"有效图像宽度",PixelYDimension:"有效图像高度",FileSource:"源文件",SceneType:"场景类型",CustomRendered:"自定义图像处理",ExposureMode:"曝光模式",WhiteBalance:"白平衡",DigitalZoomRatio:"数位变焦倍数",FocalLengthln38mmFilm:"35毫米焦距",SceneCaptureType:"取景模式",GainControl:"增益控制",Contrast:"对比度",Saturation:"饱和度",Sharpness:"锐度",SubjectDistanceRange:"主体距离范围",ExifImageWidth:"图像宽度",ExifImageLength:"图像高度",Compression:"压缩",Make:"制造厂商",Model:"相机型号",ApertureValue:"光圈数",ComponentsConfiguration:"图像构造",DateTimeDigitized:"数字化时间",DateTimeOriginal:"创建时间",ExposureProgram:"曝光程序",FlashPixVersion:"FlashPix版本",YCbCrPositioning:"色相定位",ExifVersion:"Exif版本",FirmwareVersion:"Firmware版本",Software:"软件名称",OwnerName:"OwnerName",ShutterSpeedValue:"ShutterSpeedValue",FocalPlaneResolutionUnit:"FocalPlaneResolutionUnit",FocalPlaneXResolution:"FocalPlaneXResolution",FocalPlaneYResolution:"FocalPlaneYResolution",InteroperabilityOffset:"InteroperabilityOffset",ShutterSpeedValue:"ShutterSpeedValue",ImageType:"ImageType",SubSecTime:"SubSecTime",SubSecTimeDigitized:"SubSecTimeDigitized",SubSecTimeOriginal:"SubSecTimeOriginal"};

var noInstallInfo = '浏览器没有安装Flash插件，请安装后再刷新页面查看。'

function getPxValue(value) {
  if (/%$/.test(value)) {
    width = value.replace(/%$/, '') * 10 + 'px';
  } else if (/[^px/em]$/i.test(value)) {
    value += 'px';
  }
  return value;
}

function replaceContentURL(identify, url) {
  var url = url + '&subfile=';
  var frameDocument = window.frames[identify + '-frame-content'].document;
  var tagsName = ['a', 'img'];
  var re = new RegExp('^' + frameDocument.location.protocol + '//' + frameDocument.location.host);

  for (var t = 0; t < tagsName.length;  t++) {
    var elements = frameDocument.getElementsByTagName(tagsName[t]);
    for (var x = 0; x < elements.length; x++) {
      if (tagsName[t] == 'a') {
        var href = elements[x].href;
        if (!(re.test(href))) {
          continue;
        }
        var old = href.replace(/.*\//, '');
        elements[x].href = url + old;
      } else {
        var src = elements[x].src;
        if (!(re.test(src))) {
          continue;
        }
        var old = src.replace(/.*\//, '');
        elements[x].src = url + old;
      }
    }
  }
}

function oninitFunc(oninit, identify) {
  var re = /^function\s?(.*)/;
  if (oninit instanceof Function) {
    eval(oninit(identify));
  }
  else if (re.test(oninit)) {
    var func = oninit.match(re)[1];
    if (func) {
      return eval('oninit=' + oninit + ';oninit("' + identify + '");');
    }
  }
}

/***************************************** 查看器 ************************************************/

// HTML 查看器
function render_html_viewer(url, identify, serverURL, kwargs) {
  var callback = kwargs.callback;
  if (!callback) {
    ajaxRequest(0, url, 'html', identify, serverURL, kwargs, 'HEAD');
    return;
  }
  var width = kwargs.width || 700;
  var height = kwargs.height || 450;

  if (mobileAccess) {
    var html = '<div style="overflow:scroll; -webkit-overflow-scrolling:touch; width:' + getPxValue(width) + '; height:' + getPxValue(height) + '">';
  } else {
    var html = '';
  }
  html += '<iframe name="' + identify+ '-frame-content" width="' + width + '" height="' + height + '" style="border:1px solid #c3c3c3;" src="' + url + '" onload="replaceContentURL(\'' + identify + '\',\'' + url + '\')"></iframe>';
  if (mobileAccess) {
    html += '</div>';
  }
  document.getElementById(identify).innerHTML = html;
  oninitFunc(kwargs.oninit, identify);
}

// Flash 查看器
function render_flash_viewer(url, identify, serverURL, kwargs) {
  var width = kwargs.width || 700;
  var height = kwargs.height || 537;
  var allow_print = kwargs.allow_print == 'false' || kwargs.allow_print == false ? false : true;
  var allow_copy = kwargs.allow_copy == 'false' || kwargs.allow_copy == false ? false : true;

  document.getElementById(identify).innerHTML = noInstallInfo;

  var flashvars = {};
    flashvars['swf_file'] = url;
    flashvars['subfile'] = true;
    flashvars['allow_print'] = allow_print;
    flashvars['allow_copy'] = allow_copy;
    flashvars['allow_debug'] = false;

  // 水印参数
  if (kwargs.waterprint_text != undefined) {
    flashvars['waterprint_text'] = kwargs.waterprint_text;
    flashvars['waterprint_size'] = kwargs.waterprint_size;
    flashvars['waterprint_color'] = kwargs.waterprint_color;
    flashvars['waterprint_x'] = kwargs.waterprint_x;
    flashvars['waterprint_y'] = kwargs.waterprint_y;
    flashvars['waterprint_alpha'] = kwargs.waterprint_alpha;
    flashvars['waterprint_rotation'] = kwargs.waterprint_rotation;
  }

  var params = {
    menu: false,
    bgcolor: '#efefef',
    allowFullScreen: true,
    allowScriptAccess: 'always',
    wmode: 'opaque'
  };
  var attributes = {
    'id': identify
  };
  swfobject.embedSWF(serverURL + '/edoviewer/zviewer.swf', identify, width, height, '9.0.45', null, flashvars, params, attributes);
  oninitFunc(kwargs.oninit, identify);

  /************************************ Mousewheel Event *******************************************/
  var setInt = self.setInterval(readyWheel, 50);
  function readyWheel() {
    if (document.getElementById(identify).tagName == 'OBJECT') {
      wheelSetup();
      window.clearInterval(setInt);
    }
  }
  function thisMovie(movieName) {
    if (navigator.appName.indexOf('Microsoft') != -1) {
      return window[movieName];
    } else {
      return document[movieName];
    }
  }
  function wheelSetup() {
    var eventSupported = function(eventName, el) {
    el = el || document.createElement('div');
    eventName = 'on' + eventName;
    var isSupported = (eventName in el);
    if (el.setAttribute && !isSupported ) {
      el.setAttribute(eventName, 'return;');
      isSupported = typeof el[eventName] === 'function';
    }
    el = null;
    return isSupported;
  };
  var addEvent = function(obj, type, callback) {
    if (obj.addEventListener) {
      obj.addEventListener(type, callback, false);
    }
    else if (obj.attachEvent) {
      obj.attachEvent('on' + type, callback);
    }
  }
  var type = eventSupported('mousewheel') ? 'mousewheel' : 'DOMMouseScroll';
  // 注意IE下window没有滚轮事件
  var wheel = function(obj, callback) {
    addEvent(obj, type,function(event) {
    event = event || window.event;
    var delta = 0;
    if (event.wheelDelta) {
      delta = event.wheelDelta / 120;
      // opera 9x系列的滚动方向与IE保持一致，10后修正
      if(window.opera && window.opera.version() < 10)
        delta = -delta;
      }
      else if (event.detail) {
        delta = -event.detail / 3;
      }
      // 由于事件对象的原有属性是只读，我们只能通过添加一个私有属性delta来解决兼容问题
        event.delta = Math.round(delta); // 修正safari的浮点 bug
        callback.call(obj, event);
      });
    }
    wheel(document.getElementById(identify), function(e) {
       thisMovie(identify).MOUSE_WHEEL_detail(e.delta);
    });
  }
  /****************************************** END **************************************************/
}

// 压缩包查看器
function render_zip_viewer(url, identify, serverURL, kwargs) {
  var callback = kwargs.callback;
  if (!callback) {
    ajaxRequest(0, url, 'RAR', identify, serverURL, kwargs, 'GET');
    return;
  }
  var data = kwargs.data;

  function getChildHTML(children) {
    var html = ' <b>' + children.length + '项</b><ul style="padding-left:20px;">' + renderHTML(children) + '</ul>';
    return html;
  }
  function getDisplaySize(size) {
    if (size == 0) {
      return '0KB';
    }
    else if (size <= 1024) {
      return '1KB';
    }
    else if (size > 1048576) {
      return Math.round(size/1048576.0*100)/100 + 'MB';
    }
    else {
      return Math.round(size/1024.0*100)/100 + 'KB';
    }
  }

  function renderHTML(current) {
    var html = '';
    var href_url = url.split('?');
    var params = href_url[1].split('&');
    // 因为需要拆解url，将location加上压缩包子文件的路径
    // 如果是下载链接，还需要去除mime参数
    var lastParams = '';
    var locationParams = '';
    var mimeParams = '';
    for(var index=0; index < params.length; index ++){
      var param = params[index];
      if (!param){
          continue
      }else if (param.indexOf('mime=') == 0){
        mimeParams = '&' + param;
      }
      else if (param.indexOf('location=') == 0){
        locationParams = param;
      }else{
          lastParams += '&' + param;
      }
    }

    for(var child = 0; child < current.length; child ++) {
      var children = '';
      var path = current[child]['path'];

      var download_url = serverURL + '/@@download?' + locationParams + '$$$' + encodeURL(path) + lastParams;

      if (current[child]['type'] == 'folder') {
        if (current[child]['children'].length > 0) {
          children = getChildHTML(current[child]['children']);
        }
      }
      var size = '';

      if(kwargs.download_source == '1') {
          var download = '<a href="' + download_url + '" title="下载"><img style="border:0;" src="' + serverURL + '/edoviewer/download.gif">下载</a>';
      }else{
          var download = '';
      }
      if (current[child]['size']) {
        size = getDisplaySize(current[child]['size']);
      }
      if (current[child]['type'] == 'folder') {
        html += '<li style="list-style-type:none;"><img src="' + serverURL + '/edoviewer/folder.gif" style="vertical-align:middle;"> <b>' + current[child]['name'] + '</b>' + children + size + '</li>';
      } else {
        var preview_url = serverURL + '/@@view?' + locationParams + '$$$' + encodeURL(encodeURL(path)) + mimeParams + lastParams;

        var splitname = current[child]['name'].split('.');
        if (supportExt[(splitname[splitname.length-1]).toLowerCase()]){
          html += '<table style="margin:0; width:100%;"><tr><td width="53%"><a href="' + preview_url + '" target="_blank" title="预览">' + current[child]['name'] +'</a></td>'+ children + '<td width="23%">' +size +'</td><td width="23%">'+ download + '</td></tr></table>';
        } else {
          html += '<table style="margin:0; width:100%;"><tr><td width="53%">' + current[child]['name'] + '</td>' + children + '<td width="23%">' +size +'</td><td width="23%">'+ download + '</td></tr></table>';
        }
      }
    }
    return html;
  }
  document.getElementById(identify).innerHTML = '<ul>' + renderHTML(data['children']) + '</ul>';
  oninitFunc(kwargs.oninit, identify);
}

// 音频查看器
function render_audio_viewer(url, identify, serverURL, kwargs) {
  var callback = kwargs.callback;
  if (!callback) {
    ajaxRequest(0, url, 'audio', identify, serverURL, kwargs, 'HEAD');
    return;
  }
  var width = kwargs.width || '250px';
  var ext = kwargs.ext;
  var url = url.replace(/&/g, '%26');

  // 采用 HTML5 音频
  if (swfobject.getFlashPlayerVersion()['major'] == 0 || mobileAccess) {
    var html = '<audio controls="controls">';
       html += '<source src="' + url + '" type="audio/ogg">';
       html += '<source src="' + url + '" type="audio/mpeg">';
       html += noInstallInfo;
       html += '</audio>';
    document.getElementById(identify).innerHTML = html;
    return;
  }

  if(ext != '.mid' || ext != '.wma') {
    var player = serverURL + '/edoviewer/singlemp3player.swf';
    var html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + width + '" height="20" ';
       html += 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab">';
       html += '<param name="movie" value="' + player + '?file='+ url + '&songVolume=90&showDownload=false" />';
       html += '<param name="wmode" value="transparent" />';
       html += '<embed wmode="transparent" width="' + width + '" height="20" ';
       html += 'src="' + player + '?file=' + url + '&songVolume=90&showDownload=false" ';
       html += 'type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
       html += '</object>';
  } else {
    var html = '<object id="MediaPlayer" height=46 classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95"';
       html += 'standby="Loading Windows Media Player components..." type="application/x-oleobject"';
       html += 'codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112">';
       html += '<param name="filename" value="' + url + '">';
       html += '<param name="Showcontrols" value="True">';
       html += '<param name="autoStart" value="False">';
       html += '<embed type="application/x-mplayer2" src="' + url + '" name="MediaPlayer"></embed>';
       html += '</object>';
  }
  document.getElementById(identify).innerHTML = html;
  oninitFunc(kwargs.oninit, identify);
}

// 视频查看器
function render_video_viewer(url, identify, serverURL, kwargs) {
  var callback = kwargs.callback;
  if (!callback) {
    ajaxRequest(0, url, 'video', identify, serverURL, kwargs, 'HEAD');
    return;
  }
  var width = kwargs.width || '520px';
  var height = kwargs.height || '330px';
  var ext = kwargs.ext;

  // 采用 HTML5 视频
  if (swfobject.getFlashPlayerVersion()['major'] == 0 || mobileAccess) {
    var html = '<video width="'  + width + '" height="' + height + 'px" controls="controls">';
       html += '<source src="' + url + '" type="video/mp4" />';
       html += '<source src="' + url + '" type="video/ogg" />';
       html += noInstallInfo;
       html += '</video>';
    document.getElementById(identify).innerHTML = html;
    return;
  }

  if (ext == '.swf') {
    var html = '<div class="flash-movie hVlog">'
       html += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ';
       html += 'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" ';
       html += 'width="' + width + '" height="' + height+ '" id="' + identify + '-swf-player" align="middle">';
       html += '<param name="allowScriptAccess" value="sameDomain" />'
       html += '<param name="movie" value="' + url + '" />'
       html += '<param name="quality" value="high" />'
       html += '<param name="bgcolor" value="#ffffff" />'
       html += '<param name="wmode" value="transparent" />'
       html += '<embed id="' + identify + '-swf-player-embed" src="' + url + '" quality="high" wmode="transparent" bgcolor="#ffffff" ';
       html += 'width="' + width + '" height="' + width + '" ';
       html += 'align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" ';
       html += 'pluginspage="http://www.adobe.com/go/getflashplayer" />';
       html += '</object>';
       html += '</div>';
    document.getElementById(identify).innerHTML = html;
  } else {
    var html = '<a style="display:block; width:' + getPxValue(width) + '; height:' + getPxValue(height) + ';" ';
       html += 'href="' + url + '" id="' + identify + 'player"></a>';
    document.getElementById(identify).innerHTML = html;
    flowplayer(identify + 'player', {src: serverURL + '/edoviewer/flowplayer.swf', wmode: 'opaque'}, {
      clip: {
        autoPlay: false,
        scaling: 'fit',
        autoBuffering: false
      },
      plugins: {
        controls: {
          url: serverURL + '/edoviewer/flowplayer.controls.swf',
          timeColor: '#980118',
          all: true,
          play: true,
          volume: true,
          scrubber: true,
          playlist: false,
          fullscreen: true
        }
      }
    });
  }
  oninitFunc(kwargs.oninit, identify);
}

// 图片查看器
function render_image_viewer(url, identify, serverURL, kwargs) {
  var callback = kwargs.callback;
  if (!callback) {
    ajaxRequest(0, url, 'image', identify, serverURL, kwargs, 'HEAD');
    return;
  }
  var exifURL = kwargs.exifURL;
  var ext = kwargs.ext;

  document.getElementById(identify).innerHTML = '<img src="' + url + '">';

  if(ext== '.jpg' || ext == '.jpeg' || ext == '.tiff') {
    var fun = "showEXIF('" + exifURL + "', 'image', '" + identify + "', '" + serverURL + "')";
    var html = '<br /><a href="javascript:;"; onclick="' + fun + '" />查看EXIF信息</a>';
       html += '<img src="' + serverURL + '/edoviewer/waiting.gif" id="' + identify + '-exif-waiting" style="display:none;">';
       html += '<div id="' + identify + '-exif-html"></div>';
    document.getElementById(identify).innerHTML += html;
  }
  oninitFunc(kwargs.oninit, identify);
}
function showEXIF(exifURL, type, identify, serverURL) {
  var exif_table = document.getElementById(identify + '-exif-html').getElementsByTagName('table');
  if(exif_table.length != 0) {
    if (exif_table[0].style.display == 'block') {
      exif_table[0].style.display = 'none';
    } else {
      exif_table[0].style.display = 'block';
    }
  } else {
    document.getElementById(identify + '-exif-waiting').style.display = 'block';
    ajaxRequest(0, exifURL, 'image-exif', identify, serverURL, {}, 'GET', true);
  }
}

// EXIF 查看器
function render_exif_viewer(url, identify, serverURL, kwargs) {
  var data = kwargs.data;

  var html = '<table style="border-spacing:0; line-height:1.5; display:block;">'
  for(num = 0; num < data.length; num ++) {
    var str = data[num]['title'];
      if (exifTranslate[data[num]['title']]) {
        str = exifTranslate[data[num]['title']];
      }
      // 不显示不在列表内的
      if (exifTranslate[data[num]['title']]) {
          html += '<tr><th>'+ str + '</th><td>' + data[num]['display'] + '</td></tr>';
      } else { continue; }
  }
  html += '</table>';
  document.getElementById(identify + '-exif-waiting').style.display = 'none';
  if (data.length == 0) {
    document.getElementById(identify + '-exif-html').innerHTML = '该图片没有可查看的EXIF信！';
  } else {
    document.getElementById(identify + '-exif-html').innerHTML = html;
  }
}

/****************************************** END **************************************************/
