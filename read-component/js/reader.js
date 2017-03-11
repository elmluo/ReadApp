/**
 * js for reader-components
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
        checkBkBox: document.getElementById('check_bk_box')
    };

    /**
     * 所有封装方法的入口函数
     */
    function main() {
        init();
        eventsHandle();
    }

    /**
     * 初始化方法
     */
    function init() {
        //字体初始化
        Dom.fictionContainer.style.fontSize = commonTools.getLocalStorage(curFontSize) + 'px';
    }

    /**
     * 组件使用的公共方法封装
     */
    function publicTools() {
        var pre = "reader_";
        var setLocalStorage = function (key, value) {
            return localStorage.setItem(pre + key, value);
        };
        var getLocalStorage = function (key) {
            return localStorage.getItem(pre + key)
        };

        return {
            setLocalStorage: setLocalStorage,
            getLocalStorage: getLocalStorage
        }
    }

    function readerData() {

    }

    function renderFrame() {

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
                fontContainerShow = false
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
                // console.log(target.style.visibility);
            }
        });

    }

    main();
})();