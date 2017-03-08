/**
 * js for reader-components
 */
(function () {

    /**
     * 可操作Dom元素对象
     */
    Dom = {
        actionMid: document.getElementById('action_mid'),
        topNav: document.getElementById('top_nav'),
        bottomNav: document.getElementById('bottom_nav'),
        bottomNavBk: document.getElementById('bottom_nav_bk')

    };

    /**
     * 所有方法的入口函数
     */
    function main() {
        // var publicTools = publicTools()();
        eventsHandle();
    }

    function publicTools() {
        var pre = "reader_";
        var setLocalStorage = function (key, value) {
            return localStorage.setItem(pre + key, value);
        };
        var getLocalStorage = function (key) {
            return localStorage.getItem(pre + key)
        };
    }

    function readerData() {

    }

    function renderFrame() {

    }

    /**
     * 组件事件监听交互部分
     */
    function eventsHandle() {
        //点击唤出上下导航栏
        Dom.actionMid.addEventListener("click", function(){
            Dom.topNav.style.display = "block";
            Dom.bottomNav.style.display = "block";
            Dom.bottomNavBk.style.display = "block";

        })
    }

    main();

})();