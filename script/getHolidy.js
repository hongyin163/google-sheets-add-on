const fs = require('fs')
const fetch = require('node-fetch')
const key = '11c04c1fe5abba9574f47751a7c5b015'



// 当前年份
let currentYear = new Date().getFullYear()
let nextCurrentYear = currentYear + 1


// 调休和放假的集合
const resultData = {}
resultData[currentYear] = {
  daysOff: [], // 调休
  libertyDay: [], // 放假
  hasSttisticsHolidy: [] // 已经存储的节日
}

resultData[nextCurrentYear] = {
  daysOff: [], // 调休
  libertyDay: [], // 放假
  hasSttisticsHolidy: [] // 已经存储的节日
}

// 获取传统节假日的放假安排
const getHolidyEachMonth = async(_currentYear, month) => {
  const date = _currentYear + '-' + month
  const response = await fetch(`http://v.juhe.cn/calendar/month?year-month=${date}&key=${key}`)
  const data = await response.json()
  return data.result?.data.holiday_array || []
}

const getFullYearHoliday = async() => {
  for (const _currentYear in resultData) {
    let currentData = resultData[_currentYear]
    let currentMonth = new Date().getMonth() + 1
    // 还没到今年12月份就不让他请求下一年的调休日期了，免得浪费
    if (_currentYear == nextCurrentYear && currentMonth < 12) {
      continue;
    }
    for(let i = 1; i <= 12; i++) {
      const _holidyArray = await getHolidyEachMonth(_currentYear, i)
      // const _holidyArray = mockData[i - 1]
      _holidyArray.forEach(item => {
        if (!currentData.hasSttisticsHolidy.includes(item.name)) {
          currentData.hasSttisticsHolidy.push(item.name)
          item.list.forEach((holidyitem) => {
            if (holidyitem.status === '1') {
              currentData.libertyDay.push(holidyitem.date)
            }
            if (holidyitem.status === '2') {
              currentData.daysOff.push(holidyitem.date)
            }
          })
        }
      })
    }
  }
  
  // 写入文件
  fs.writeFile('holiday.json', JSON.stringify(resultData), (res) => {
    console.log('获取假期完成')
  })
}

getFullYearHoliday()


