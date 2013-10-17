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

易度查看器：

       edo_viewer('http://your.server.ip:port', 'file:///var/aa.doc', 'doc-viewer', 700, 700, allow_print, allow_text, watermark_info)

具体包括的查看器：

- 图片查看器

             render_image_viwer(div_id, src, width, height, allow_print, allow_text, watermark_info)

- html查看器

            render_html_viwer(div_id, src, width, height, ....

- 压缩包查看器

            render_zip_viewer(div_id, src, width, height, ....

- 音频查看器

            render_audio_viewer(div_id, src, width, height, ....

- 视频查看器

            render_video_viewer(div_id, src, width, height, ....


