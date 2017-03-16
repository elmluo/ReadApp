/**
 * 立即调用，变成私有作用域。
 */
(function () {
    /**
     * 一些常用的变量
     */
        // var publicTools = publicTools();     函数 = 值(对象)。这样的赋值不对。
    var commonTools = publicTools();
    var navShow = false;
    var fontContainerShow = false;
    var curFontSize;
    var fontSize = commonTools.getLocalStorage(curFontSize);
    var curBkColor;
    var bkColor = commonTools.getLocalStorage(curBkColor);
    var readerData;
    /**
     * 可操作Dom元素对象
     */
    Dom = {
        actionMid: document.getElementById('action_mid'),
        topNav: document.getElementById('top_nav'),
        bottomNav: document.getElementById('bottom_nav'),
        bottomNavBk: document.getElementById('bottom_nav_bk'),
        fontObj: document.getElementById('font_button'),
        fontContainer: document.getElementsByClassName('font_container')[0],
        fontContainerBk: document.getElementsByClassName('font_container')[1],
        largeFontBtn: document.getElementById('large_font'),
        smallFontBtn: document.getElementById('small_font'),
        fictionContainer: document.getElementById('fiction_container'),
        checkBkBox: document.getElementById('check_bk_box'),
        nightBtn: document.getElementById('night_button'),
        dayBtn: document.getElementById('day_button'),
        preBtn: document.getElementById('prev_button'),
        nextBtn: document.getElementById('next_button'),
        isLoading: document.getElementById('isLoading')
    };

    /**
     * 所有封装方法的入口函数
     */
    function main() {
        init();
        readerData = readerData();
        readerData.initData(function(data){
            renderUI(Dom.fictionContainer, data)
        });
            
        eventsHandle();
    }

    /**
     * 初始化方法
     */
    function init() {
        //字体初始化
        Dom.fictionContainer.style.fontSize = fontSize + 'px';
        //背景初始化
        document.body.style.backgroundColor = bkColor;
    }

    /**
     * 组件使用的公共方法封装
     */
    function publicTools() {
        //本地缓存
        var pre = "reader_";
        var setLocalStorage = function (key, value) {
            return localStorage.setItem(pre + key, value);
        };
        var getLocalStorage = function (key) {
            return localStorage.getItem(pre + key)
        };

        //ajax异步请求
        var _ajax = function (method, url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var response = JSON.parse(xhr.responseText);
                    callback(response);
                }
            };
            xhr.open(method, url, true);
            xhr.send();
        };

        //插件跨域获取文章内容，base64插件解码，执行回调
        var getJSONP = function (url, callback) {
            return $.jsonp({
                url: url,
                cache: true,
                callback: 'duokan_fiction_chapter',
                success: function (data, xOptions, textStatus) {
                    console.log(textStatus);
                    var result = $.base64.decode(data);
                    var jsonObj = JSON.parse(decodeURIComponent(escape(result)));
                    callback(jsonObj);
                },
                error: function (xOptions, textStatus) {
                    console.log(textStatus);
                }
            })
        };

        return {
            setLocalStorage: setLocalStorage,
            getLocalStorage: getLocalStorage,
            getJSONP: getJSONP,
            _ajax: _ajax
        }
    }

    /**
     * 组件和服务器数据交互部分
     */
    function readerData() {

        var realChapterId = 1;
        var realChapterTotal;

        //初始化数据,传入渲染DOM回调
        var initData = function (callbackUI) {
            getChapterInfos(function () {
                getChapterContent( realChapterId, function (data) {
                    // 拿到章节内容，隐藏加载动画。
                    Dom.isLoading.style.display = "none";
                    callbackUI && callbackUI(data);
                });
            });
        };

        //获取章节信息
        var getChapterInfos = function (callback) {
            commonTools._ajax("get", "./data/chapter.json", function (data) {
                // realChapterId = commonTools.getLocalStorage("curChapterId");  
                if (realChapterId === null) {       // 如果刚开始没有本地存储章节Id，章节返回信息里面拿去初始化数据。
                    realChapterId = data.chapters[1].chapter_id;
                }
                realChapterTotal = data.chapters.length;
                callback && callback();
            });
        };

        //根据章节id获取data文件内容(jsop跨域地址)，请求jsonp地址获取内容
        var getChapterContent = function (chapterId, callback) {
            commonTools._ajax("get", "./data/data" + chapterId + ".json", function (data) {   // response-->data
                commonTools.getJSONP( data.jsonp, function (data) { 
                    callback && callback(data);
                });
            })
        };

        // 向前翻页功能
        var preChapter = function (callbackUI) {
            realChapterId = parseInt(realChapterId, 10); 
            if (realChapterId == 1) return;
            realChapterId--;
            getChapterContent(realChapterId, callbackUI);
            commonTools.setLocalStorage("curChapterId", realChapterId);
        };

        // 向后翻页功能
        var nextChapter = function (callbackUI) {
            realChapterId = parseInt(realChapterId, 10);
            if(realChapterId === realChapterTotal ) return;
            realChapterId++;
            getChapterContent(realChapterId, callbackUI);
            commonTools.setLocalStorage("curChapterId", realChapterId)
        }; 

        return {
            initData: initData,
            preChapter: preChapter,
            nextChapter: nextChapter
        }
    }

    /**
     * 数据的DOM渲染
     *     可以拼接字符串，也可以innerHTML
     */
    function renderUI(DomContainer, data) {
        var html = "<h4>" + data.t + "</h4>" ;
        for (var i=0; i < data.p.length; i++) {
            html += "<p>" + data.p[i] + "</p>";
        } 
        DomContainer.innerHTML = html;
    }

    /**
     * 组件事件监听交互部分
     */
    function eventsHandle() {
        //点击显示和隐藏上下导航栏
        Dom.actionMid.addEventListener("click", function () {
            if (navShow == false) {
                Dom.topNav.style.display = "block";
                Dom.bottomNav.style.display = "block";
                Dom.bottomNavBk.style.display = "block";
                navShow = true;
            } else {
                Dom.topNav.style.display = "none";
                Dom.bottomNav.style.display = "none";
                Dom.bottomNavBk.style.display = "none";
                navShow = false;
                //同时隐藏字体设置栏
                Dom.fontContainer.style.display = "none";
                Dom.fontContainerBk.style.display = "none";
                fontContainerShow = false;
            }
        });

        //点击字体，显隐字体面板
        Dom.fontObj.addEventListener("click", function () {
            if (fontContainerShow == false) {
                Dom.fontContainer.style.display = "block";
                Dom.fontContainerBk.style.display = "block";
                fontContainerShow = true;
            } else {
                Dom.fontContainer.style.display = "none";
                Dom.fontContainerBk.style.display = "none";
                fontContainerShow = false;
            }
        });

        //滑动屏幕，隐藏上下菜单栏和字体面板
        //也可以用H5classList.toggle('className') IE10
        window.addEventListener("scroll", function () {
            Dom.topNav.style.display = "none";
            Dom.bottomNav.style.display = "none";
            Dom.bottomNavBk.style.display = "none";
            navShow = false;
            Dom.fontContainer.style.display = "none";
            Dom.fontContainerBk.style.display = "none";
            fontContainerShow = false
        });

        // 字体设置大小交互开发
        Dom.largeFontBtn.addEventListener('click', function () {
            //判断语句写在最前面前面妥当
            if (fontSize == 20) return;
            ++fontSize;
            Dom.fictionContainer.style.fontSize = fontSize + 'px';
            commonTools.setLocalStorage(curFontSize, fontSize);
        });
        Dom.smallFontBtn.addEventListener('click', function () {
            if (fontSize == 14) return;
            --fontSize;
            Dom.fictionContainer.style.fontSize = fontSize + 'px';
            console.log(fontSize);
            commonTools.setLocalStorage(curFontSize, fontSize);
        });

        //字体面板当中“背景”切换
        //事件委托
        Dom.checkBkBox.addEventListener('click', function (ev) {
            var ev = ev || window.event;
            var target = ev.target || ev.srcElement;
            if (target !== this) {
                document.body.style.backgroundColor = target.style.backgroundColor;
                target.parentNode.style.visibility = "visible";
                commonTools.setLocalStorage(curBkColor, document.body.style.backgroundColor)
            }
        });

        // 白天黑夜阅读模式切换
        Dom.nightBtn.addEventListener('click', function () {
            this.style.display = "none";
            Dom.dayBtn.style.display = "inline-block";
            bkColor = "#283548";
            document.body.style.backgroundColor = bkColor;
            commonTools.setLocalStorage(curBkColor, bkColor);
        });
        Dom.dayBtn.addEventListener('click', function () {
            this.style.display = "none";
            Dom.nightBtn.style.display = "inline-block";
            bkColor = "#e9dfc7";
            document.body.style.backgroundColor = bkColor;
            commonTools.setLocalStorage(curBkColor, bkColor);
        });

        // 向前向后翻页
        Dom.preBtn.addEventListener('click', function () {
            readerData.preChapter(function (data) {
                renderUI(Dom.fictionContainer,data);
            });
        })
        Dom.nextBtn.addEventListener('click', function () {
            readerData.nextChapter(function (data) {
                renderUI(Dom.fictionContainer,data);
            });
        })
    }

    main();
})();