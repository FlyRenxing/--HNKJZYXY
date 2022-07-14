/**
2022.07 适配新版教务，使用内部接口调取课程信息
*/
function scheduleHtmlParser(html) {
    //除函数名外都可编辑
    //传入的参数为上一步函数获取到的html
    //可使用正则匹配
    //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://cnodejs.org/topic/5203a71844e76d216a727d2e
    let courses = [];
    const res = JSON.parse(html);
    res.data.forEach(course => {
        let weeks = [];
        let sections = [];
        for (let i=parseInt(course.qsz); i <= parseInt(course.jsz); i++) {
            weeks.push(parseInt(i));
        }
        for (let i=parseInt(course.ksj); i <= parseInt(course.jsj); i++) {
            sections.push(parseInt(i));
        }
        courses.push({
            name: course.kcmc,// 课程名称
            position: course.jsmc,// 上课地点
            teacher: course.xm, // 教师名称
            weeks: weeks, // 周数
            day: course.xqj, // 星期
            sections: sections, // 节次
        })
    });
    return courses
}

