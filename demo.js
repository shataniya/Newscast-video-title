// http://tv.cctv.com/lm/xwlb/day/20200330.shtml
// http://tv.cctv.com/lm/xwlb/day/20200301.shtml
// http://tv.cctv.com/lm/xwlb/day/20200301.shtml
const axios = require('axios')
const $ = require('websect')
const fs = require('fs')
const _ = require('reero')

// 判断是不是闰年
function isrun(year){
    if(year % 4 === 0 && year % 100 !== 0 || year % 400 === 0){
        return true
    }
    return false
}

// 每月的天数
function get_month_days(year, month){
    switch(month){
        case 1:
            return 31
        case 2:
            if(isrun(year)){
                return 29
            }
            return 28
        case 3:
            return 31
        case 4:
            return 30
        case 5:
            return 31
        case 6:
            return 30
        case 7:
            return 31
        case 8:
            return 31
        case 9:
            return 30
        case 10:
            return 31
        case 11:
            return 30
        case 12:
            return 31
    }
}

function get_one_day_news(year, month, day){
    var day = typeof day === 'number' ? formate(day) : day
    var month = typeof month === 'number' ? formate(month) : month
    var timestring = year+month+day
    var url = 'http://tv.cctv.com/lm/xwlb/day/'+timestring+'.shtml'
    // console.log(url)
    return new Promise((resolve, reject)=>{
        var news_list = []
        _(url).then(response=>{
            var str = response.text
            if(str.length === 1556){
                // 说明出现了错误
                reject(news_list)
            }else{
                $(str).find('li').each(el=>{
                    var _object = {}
                    var image = 'http:'+$(el).find('img').dom()[0].src
                    var title = $(el).find('div.title').dom()[0].innerHTML
                    var time = $(el).find('div.bottom').dom()[0].innerHTML
                    _object = { image, title, time }
                    news_list.push(_object)
                })
                // console.log(news_list)
                console.log(url)
                // fs.writeFile('demo.json', JSON.stringify(news_list, null, 5), function(){
                //     console.log('demo.json have build...')
                // })
                resolve(news_list)
            }
        })
    })
}

function get_one_month_news(year, month){
    // var month = typeof month === 'number' ? formate(month) : month
    var day_num = get_month_days(year, month)
    // console.log(day_num)
    console.log(month)
    return new Promise((resolve, reject)=>{
        var news_list = []
        function anls(index){
            if(index > day_num){
                resolve(news_list) 
            }else{
                get_one_day_news(year, month, index).then(data=>{
                    news_list = news_list.concat(data)
                    anls(index+1)
                }, data=>{
                    // 这里要进行错误判断
                    news_list = news_list.concat(data)
                    resolve(news_list)
                })
            }
        }
        anls(1)
    })
}

function formate(num){
    if(num < 10){
        return '0'+num
    }
    return num
}

function get_one_year_news(year){
    return new Promise((resolve, reject)=>{
        var news_list = []
        function anls(index){
            if(index > 12){
                resolve(news_list)
            }else{
                get_one_month_news(year, index).then((data)=>{
                    news_list = news_list.concat(data)
                    anls(index+1)
                })
            }
        }
        anls(1)
    })
}

function get_section_year_news(start, end){
    return new Promise((resolve, reject)=>{
        var news_list = []
        function anls(index){
            if(index > end){
                resolve(news_list)
            }else{
                get_one_year_news(index).then(data=>{
                    news_list = news_list.concat(data)
                    anls(index+1)
                })
            }
        }
        anls(start)
    })
}

// get_one_year_news(2020).then(data=>{
//     console.log(data)
// })

get_section_year_news(2017, 2020).then(data=>{
    fs.writeFile('news.json', JSON.stringify(data, null, 5), function(){
        console.log('news.json is build...')
    })
})