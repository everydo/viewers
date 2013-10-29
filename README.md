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

可以简单的如下调用

    edo_viewer(serverURL, sourceURL, identify, kwargs)

kwargs是一个展示参数，包括：

- width：宽度
- height：高度
- allow_print：是否允许打印
- allow_copy：是否允许复制
- waterprint_text: 水印文字
- waterprint_size: 水印字体大小
- waterprint_alpha: 水印透明度
- waterprint_color：水印颜色
- waterprint_x: x方向位置
- waterprint_y: y方向位置
- waterprint_rotation: 方向旋转

也可以单独调用查看器：

- 纯文本查看器

            render_text_viewer(sourceURL, identidy, serverURL, kwargs)

- 图片查看器

            render_image_viwer(sourceURL, identidy, serverURL, kwargs)

- html查看器

            render_html_viwer(sourceURL, identidy, serverURL, kwargs)

- 压缩包查看器

            render_zip_viewer(sourceURL, identidy, serverURL, kwargs)

- 音频查看器

            render_audio_viewer(sourceURL, identidy, serverURL, kwargs)

- 视频查看器

            render_video_viewer(sourceURL, identidy, serverURL, kwargs)

- 易度的pdf转换swfx查看器

            render_flash_viewer(sourceURL, identidy, serverURL, kwargs)

上传文件后，打开查看器，如果文档没有转换过，则会发起转换。
如果希望通过程序主动发起转换（而不是查看器），可以直接调用这个API：

        prepare_for_view(sourceURL, serverURL)
