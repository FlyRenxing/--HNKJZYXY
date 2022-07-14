async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    var url = window.location.pathname;

    if (url.indexOf("/framework/") == 0) {
        // 此步为必须，用于加载这个工具，后续会增加更多方法
        await loadTool('AIScheduleTools')
        // 使用它们的时候务必带上await，否则没有系统alert的时停效果
        await AIScheduleAlert('您还未登录本系统，请登陆后再试！')
        return 'do not continue'
    }
    let className;
    let table = await getTable();
    const str = (await table.text()).toString();
    console.log(str)
    if (str.indexOf("班级：") > -1) {
        className = str.split("班级：")[1].split("<")[0];
    } else {
        return 'do not continue'
    }
    let course = await getCourseByBJMCInThisSemester(className);
    const res = course.text()
    return res

}

function getTable() {
    return fetch('/jsxsd/grxx/xsxx')
}

function getCourseByBJMCInThisSemester(className) {
    return fetch(`http://jxzlpj.hnkjxy.net.cn/api/dataStand/courseByBJMCInThisSemester?bjmc=${className}`)
}