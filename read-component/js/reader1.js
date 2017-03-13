(function(){
    'use strict';
    var Util = (function(){
        //封装一个localStorage的方法，防止冲突。
        var prefix = "html_reader";
        var StorageGetter = function(key){
            return localStorage.getItem(prefix+key);
        }
        var StorageSetter = function(key,val){
            return localStorage.setItem(prefix+key,val);
        }
        //封装一个获取章节内容的方法
        var getBSONP = function(url,callback){
            return $.jsonp({//插件封装好的功能
                url:url,
                cache: true,//是否缓存。
                callback:'duokan_fiction_chapter',//两个callback不同，这里的callback 获得的是文件开头的声明的方法。
                success: function(result){// 请求成功之后获取的数据注入result。
//								debugger//断点，查看获取资源是否成功。
                    var data = $.base64.decode(result);//获取的数据需要插件base64解码
                    var json = decodeURIComponent(escape(data));//escape()将获取的进行ASCII编码成中文
                    callback(json);
                }
            })
        }
        return {
            getBSONP:getBSONP,
            StorageGetter:StorageGetter,
            StorageSetter:StorageSetter
        }
    })();

    //申明一些常用的变量
    var Dom = {
        top_nav : $('#top-nav'),
        bottom_nav : $('.bottom_nav'),
        font_container : $('.font_container'),
        font_button: $('#font_button')
    }
    var Win = $(window);
    var Doc = $(document);
    var readerModel;
    var readerUI;
    var fictionContainer = $('#fiction_container');
    var initFontSize = Util.StorageGetter('font_size');
    initFontSize = parseInt(initFontSize);
    if(!initFontSize){
        initFontSize = 14;
    }
    fictionContainer.css('font-size',initFontSize);

    // todu 整个项目的入口函数.
    function main(){
        readerModel = ReaderModel();
        readerUI = ReaderBaseFrame(fictionContainer)
        readerModel.init(function(data){
            readerUI(data);
        });
        EventHanlder();
    }

    //todo 实现阅读器和服务器相关的数据结构交互部分。
    function ReaderModel(){
        var Chapter_id;
        var ChapterTotal;
        //初始化渲染。
        var init = function(UIcallback){
            //获取章节列表（页码）
            getFictionInfo(function(){
                //获取章节内容
                getChapterContent(Chapter_id,function(data){
                    //todo 数据渲染相关的东西。
                    UIcallback&&UIcallback(data);
                });
            })
            // getFictionInfoPromise().then(function(){
            // //请求成功之后会调用then方法执行操作。
            // 	return getChapterContentPromise();
            // }).then(function(data){
            // 		UIcallback&&UIcallback(data);
            // });
        };

        //todo 获得章节信息(包含所有章节标题，页码的json文件)之后的回调(获得章节信息之后要干嘛)。
        var getFictionInfo = function(callback){
            $.get('data/chapter.json',function(data){
                //todo 获取章节信息之后业务逻辑可以事先不写，根据实际情况编写
                Chapter_id = Util.StorageGetter('last_chapter_id');
                if(Chapter_id == null){//如果没有记录当前页码信息，则用初始页码。
                    Chapter_id = data.chapters[1].chapter_id;
                }
                ChapterTotal = data.chapters.length;
                // debugger;
                callback && callback();
            },'json');
        };

        // 使用Promise对象，用代码的平行结构来代替，callback的多层嵌套结构
        //  var promise = new Promise(function(resolve, reject) {
        // 	  //  some sync code
        // 	if ( 异步操作成功 ){
        // 	   resolve(value);
        // 	} else {
        // 	   reject(error);
        // 	}
        // });

        // var getFictionInfoPromise = function(){
        // 	return new Promise(function(resolve,reject){
        // 		$.get('data/chapter.json',function(data){
        // 			if(data.result == 0){
        // 	 		Chapter_id = Util.StorageGetter('last_chapter_id');
        // 	 		if(Chapter_id == null){//如果没有记录当前页码信息，则用初始页码。
        // 	 			Chapter_id = data.chapters[1].chapter_id;
        // 	 		}
        // 	 		ChapterTotal = data.chapters.length;
        // 	 		resolve();
        // 			}else{
        // 				reject();
        // 			}
        // 		},'json');
        // 	})
        // };

        // TODO 获取章节内容
        var getChapterContent = function(chapter_id,callback){
            $.get('data/data'+chapter_id +'.json',function(data){//根据章节的id这个变量，拼接字符串，来获取具体章节的目录
                if(data.result == 0){//和后台约定返回成功的方式
                    var url = data.jsonp;
                    Util.getBSONP(url,function(data){//调用之前封装好的获取调用内容的方法
                        // debugger;
                        callback && callback(data); // if(callback){ callback() }
                    });
                }
            },'json')
        }

        // var getChapterContentPromise = function(){
        // 	return new Promise(function(resolve,reject){
        // 		$.get('data/data'+Chapter_id +'.json',function(data){
        //  		if(data.result == 0){
        //  			var url = data.jsonp;
        //  			Util.getBSONP(url,function(data){
        //  				// debugger;
        //  				// callback && callback(data); // if(callback){ callback() }
        //  			resolve(data);
        //  			});
        //  		}else{
        //  			reject();
        //  		}
        // 		},'json')
        // 	})
        // }

        //实现上下翻页章节内容的获取
        var prevChapter = function(UIcallback){
            Chapter_id = parseInt(Chapter_id,10);
            if(Chapter_id == 0){
                return;
            }
            Chapter_id -=1;
            getChapterContent(Chapter_id,UIcallback);
            Util.StorageSetter('last_chapter_id',Chapter_id);
        }
        var nextChapter = function(UIcallback){
            Chapter_id = parseInt(Chapter_id,10);
            if(Chapter_id == ChapterTotal){
                return;
            }
            Chapter_id +=1;
            getChapterContent(Chapter_id,UIcallback);
            Util.StorageSetter('last_chapter_id',Chapter_id);
        }
        return {
            init: init,
            prevChapter:prevChapter,
            nextChapter:nextChapter
        }
    }
    //todo 渲染基本的Ui结构
    function ReaderBaseFrame(container){//传入容器，可以使得方法扩展性能更好
        function parseCapterData(jsonData){
            var jsonObj = $.parseJSON(jsonData);//将返回的字符串解析成json格式对象。
            var html = '<h4>' + jsonObj.t +'</h4>';//这里没有用到模板引擎，所以我用了拼接字符串的方式。
            for(var i=0; i<jsonObj.p.length; i++){// 章节内容是一个数组，遍历数据
                html += '<p>' + jsonObj.p[i] + '</p>';
            }
            return html;//返回获取的章节内容
        }
        return function(data){
            container.html(parseCapterData(data));//将章节内容注入容器
        }
    }
    //todo 交互事件的绑定
    function EventHanlder(){

        //touch
        //zepto 中tap
        //android 4.0 click 300ms
        //click 不愿意做pc端浏览器的兼容可以用clikc

        //点击屏幕弹出上下菜单栏
        $('#action_mid').click(function(){
            if(Dom.top_nav.css('display')=='none'){
                Dom.bottom_nav.show();
                Dom.top_nav.show();
            }else{
                Dom.bottom_nav.hide();
                Dom.top_nav.hide();
                Dom.font_container.hide();
            }
        })

        //屏幕滚动隐藏
        Win.scroll(function(){
            Dom.bottom_nav.hide();
            Dom.top_nav.hide();
            Dom.font_container.hide();
        });

        //调出字体背景控制面板。改变字体按钮样式。
        Dom.font_button.click(function() {
            if(Dom.font_container.css('display')=='none'){
                Dom.font_container.show();
                $('.icon-font').css('display','none');
                $('.icon-font-current').css('display','block');
            }else{
                Dom.font_container.hide();
                $('.icon-font').css('display','block');
                $('.icon-font-current').css('display','none');
            }
        });

        //todo 同时触发背景切换事件。
        $('#night_button').click(function(){

        });

        //改变字体大小并且保存设置
        $('#large_font').click(function() {
            if(initFontSize>20){
                return;
            }
            initFontSize+=1;
            fictionContainer.css('font-size',initFontSize);
            //本地储存设置好的字体大小
            Util.StorageSetter('font_size',initFontSize);
        });
        $('#small_font').click(function() {
            if(initFontSize<12){
                return;
            }
            initFontSize-=1;
            fictionContainer.css('font-size',initFontSize);
            Util.StorageSetter('font_size',initFontSize);
        });

        //改变背景颜色
        $('.bk-container').click(function(){
            fictionContainer.css("background-color",'red');
        });

        //todo 获取上下章数据内容-->把数据拿来做渲染。
        $('#prev_button').click(function(){
            readerModel.prevChapter(function(data){
                readerUI(data);
            });
        });
        $('#next_button').click(function(){
            readerModel.nextChapter(function(data){
                readerUI(data);
            });
        });

    }
    main();//直接调用入口函数。
})();
