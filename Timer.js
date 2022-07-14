/**
 * 时间配置函数，此为入口函数，不要改动函数名
 */
async function scheduleTimer({
    providerRes,
    parserRes
} = {}) {
    let timer = {
        totalWeek: 20, // 总周数：[1, 30]之间的整数
        startSemester: '', // 开学时间：时间戳，13位长度字符串，推荐用代码生成
        startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
        showWeekend: true, // 是否显示周末
        forenoon: 4, // 上午课程节数：[1, 10]之间的整数
        afternoon: 8, // 下午课程节数：[0, 10]之间的整数
        night: 0, // 晚间课程节数：[0, 10]之间的整数
        sections: [{
            section: 1, // 节次：[1, 30]之间的整数
            startTime: '08:00', // 开始时间：参照这个标准格式5位长度字符串
            endTime: '08:50', // 结束时间：同上
        }], // 课程时间表，注意：总长度要和上边配置的节数加和对齐
    }
    const semester = await fetch('http://jxzlpj.hnkjxy.net.cn/api/dataStand/semester/now')
    const semesterRes = await semester.json()
    semesterRes.data
    timer.totalWeek = parseInt(semesterRes.data[0].zzskz);
    //2018-09-07
    let xqqssj = semesterRes.data[0].xqqssj.split('-');
    console.log(xqqssj);
    timer.startSemester = new Date(xqqssj[0], xqqssj[1] - 1, xqqssj[2]).getTime().toString();

    //开始计算时间
    let forenoonTime;
    let afternoonTime;
    let interval;
    let period;
    await loadTool('AIScheduleTools')
    // 模拟Prompt，参数是个对象，具体内容看注释，返回值是String
    forenoonTime = await AISchedulePrompt({
        titleText: '请输入上午开始时间', // 标题内容，字体比较大，超过10个字不给显示的喔，也可以不传就不显示
        tipText: '请输入上午第一节课的开始时间，以半角冒号间隔时分的五位个字符。如：08:20，代表早上的八点二十分开始上第一节课。', // 提示信息，字体稍小，支持使用``达到换行效果，具体使用效果建议真机测试，也可以不传就不显示
        defaultText: '', // 文字输入框的默认内容，不传会显示版本号，所以空内容要传个''
        validator: value => { // 校验函数，如果结果不符预期就返回字符串，会显示在屏幕上，符合就返回false
            if (value === '') return '不可为空'
            if (value.length !== 5) return '格式不正确'
            if (value.indexOf(':') !== 2) return '格式不正确'
            return false
        }
    })
    afternoonTime = await AISchedulePrompt({
        titleText: '请输入下午开始时间', // 标题内容，字体比较大，超过10个字不给显示的喔，也可以不传就不显示
        tipText: '请输入下午第一节课的开始时间，以半角冒号间隔时分的五位个字符。如：14:20，代表下午的两点二十分开始上第一节课。', // 提示信息，字体稍小，支持使用``达到换行效果，具体使用效果建议真机测试，也可以不传就不显示
        defaultText: '', // 文字输入框的默认内容，不传会显示版本号，所以空内容要传个''
        validator: value => { // 校验函数，如果结果不符预期就返回字符串，会显示在屏幕上，符合就返回false
            if (value === '') return '不可为空'
            if (value.length !== 5) return '格式不正确'
            if (value.indexOf(':') !== 2) return '格式不正确'
            return false
        }
    })
    interval = await AISchedulePrompt({
        titleText: '请输入课程时长', // 标题内容，字体比较大，超过10个字不给显示的喔，也可以不传就不显示
        tipText: '请输入一节课的课程时长，整数，单位分钟，如：45，代表每节课时长45分钟。', // 提示信息，字体稍小，支持使用``达到换行效果，具体使用效果建议真机测试，也可以不传就不显示
        defaultText: '', // 文字输入框的默认内容，不传会显示版本号，所以空内容要传个''
        validator: value => { // 校验函数，如果结果不符预期就返回字符串，会显示在屏幕上，符合就返回false
            if (value === '') return '不可为空'
            try {
                if (parseInt(value) < 0) return '不可为负数'
            } catch {
                return '不可为非数字'
            }
            return false
        }
    })
    period = await AISchedulePrompt({
        titleText: '请输入下课间隔时间', // 标题内容，字体比较大，超过10个字不给显示的喔，也可以不传就不显示
        tipText: '请输入下课间隔时间，整数，单位分钟，如：10，代表每节课间隔10分钟。', // 提示信息，字体稍小，支持使用``达到换行效果，具体使用效果建议真机测试，也可以不传就不显示
        defaultText: '', // 文字输入框的默认内容，不传会显示版本号，所以空内容要传个''
        validator: value => { // 校验函数，如果结果不符预期就返回字符串，会显示在屏幕上，符合就返回false
            if (value === '') return '不可为空'
            try {
                if (parseInt(value) < 0) return '不可为负数'
            } catch {
                return '不可为非数字'
            }
            return false
        }
    })
    let sections = []
    let forenoonTimer = new Date(0)
    forenoonTimer.setHours(forenoonTime.split(':')[0])
    forenoonTimer.setMinutes(forenoonTime.split(':')[1])
    for (let i = 1; i <= 12; i++) {
        let s = forenoonTimer.getHours().toString().padStart(2, "0") + ':' + forenoonTimer.getMinutes().toString().padStart(2, "0"); // 开始时间：参照这个标准格式5位长度字符串
        forenoonTimer.setTime(forenoonTimer.getTime() + parseInt(interval) * 60 * 1000) // 开始时间加上间隔时间
        let e = forenoonTimer.getHours().toString().padStart(2, "0") + ':' + forenoonTimer.getMinutes().toString().padStart(2, "0"); // 结束时间：参照这个标准格式5位长度字符串
        sections.push({
            section: i, // 节次：[1, 30]之间的整数
            startTime: s,
            endTime: e
        })
        forenoonTimer.setTime(forenoonTimer.getTime() + parseInt(period) * 60 * 1000) // 结束时间加上下课时间
        if (i == 4) {
            forenoonTimer.setHours(afternoonTime.split(':')[0])
            forenoonTimer.setMinutes(afternoonTime.split(':')[1])
        }
    }
    timer.sections = sections

    return timer;
}