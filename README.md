viewers
=======

易度云查看的查看器

参看：http://viewer.everydo.com

查看器的功能：

- 支持多种查看器
- 设置查看器的大小
- 如果查看文件还未生成，自动重复请求
- 是否允许选择文字
- 是否允许打印
- 设置水印信息

其中水印信息包括：

1. 指定文字内容和图片路径
2. 指定位置（平铺、左上角等）
3. 指定字体大小、图片大小
4. 指定文字颜色、字体（粗体、斜体等）
5. 指定文字、图片的透明度

具体包括的查看器：

- 纯文本查看器

            render_text_viewer(url, identidy, serverURL, kwargs)

- 图片查看器

            render_image_viwer(url, identidy, serverURL, kwargs)

- html查看器

            render_html_viwer(url, identidy, serverURL, kwargs)

- 压缩包查看器

            render_zip_viewer(url, identidy, serverURL, kwargs)

- 音频查看器

            render_audio_viewer(url, identidy, serverURL, kwargs)

- 视频查看器

            render_video_viewer(url, identidy, serverURL, kwargs)

- 易度的pdf转换swfx查看器

            render_flash_viewer(url, identidy, serverURL, kwargs)

