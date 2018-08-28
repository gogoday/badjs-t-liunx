
'use strict';
const path = require('path')
const nodemailer = require('nodemailer');
const Promise = require('bluebird')
const log4js = require('log4js');
const logger = log4js.getLogger();
global.pjconfig = require(path.join(__dirname, '../project.json'))

const emailConf = global.pjconfig.email;
const sendMailer = require(path.resolve(__dirname, './email_tof2.js'))



// setup e-mail data with unicode symbols
let mailOptions = {
    from: emailConf.from , // sender address
};

let mailList = [];

module.exports = (from, to, cc, title, content, attachments) => {

    let  _mailOptions = Object.assign({}, mailOptions);

    _mailOptions.to = to;
    _mailOptions.cc = cc;
    _mailOptions.subject = title;
    _mailOptions.html = content;

    if (attachments) {
        _mailOptions.attachments = attachments;
    }

    // console.log(content);
     // _mailOptions.to = 'xx@x.com';
     // _mailOptions.cc = 'x@x.com';

    console.log(`to: ${to}, cc: ${cc}, subject: ${title}`);

    // 第一次进来开始倒计时，后面进来的不走这个逻辑
    if (mailList.length == 0) {
        timeoutSendMail();
    }

    //sendMail(_mailOptions);
    // 先放到池子中，再每隔一段时间发送，避免触发频率限制，疑似垃圾邮件
    mailList.push(_mailOptions);

    // console.log('mailList');
    // console.log(mailList)

}


function timeoutSendMail() {

    // 3 分钟后 处理mailList 中的数据 合并同一个的人的邮件，变成每个人只发一封邮件，避免发邮件失败的情况
    setTimeout(() => {

        console.log(`mailList.length: ${mailList.length}`)

        let userList = {};

        // 从邮件纬度变成用户纬度
        mailList.forEach(item => {
            // 一个邮件item的结构是怎样的
            /*
           { from: '',
           to: [ 'xxxx@xxxx.com' ],
           cc: [],
           // 标题需要统一 "【IVWEB BadJs】top error日报"
           subject: '标题',
           html: '邮件正文',
           // 附件这里需要合并数组
           attachments:
            [ { filename: '00095001.png',
                path: 'http://xxxx/static/img/tmp/15164856044013.png',
        cid: '000950' } ] }
           */
            var toMail = item.to;
            toMail = toMail.concat(item.cc);
            toMail.forEach(to_item => {

                if (!userList[to_item]) {
                    userList[to_item] = [];
                }
                userList[to_item].push(item);
            })
        })

        // 3分钟后清空mailList，保证第二天进来后可以倒计时
        mailList = [];

        console.log('userList')
        for (var i in userList) {
                console.log('user: ' + i);
            console.log('mailLenth: ' + userList[i].length);
            userList[i].forEach(item => {
                    console.log(item.subject);
                })
        }

        let newMailList = [];
        for(var i in userList) {
            let concatMailObj = {
                from: mailOptions.from,
                to: [i],
                cc: [],
                subject: '【BadJs】top error日报',
                html: [],
                attachments: []
            };
            userList[i].forEach(item => {
                concatMailObj.html.push(item.html);
                concatMailObj.attachments = concatMailObj.attachments.concat(item.attachments);
            })
            concatMailObj.html = concatMailObj.html.join('<br/><br/>');
            newMailList.push(concatMailObj)
        }

        console.log('newMailList');
        newMailList.forEach(item => {
            console.log('to: ' + item.to)
            console.log('attachments.length: ' + item.attachments.length);
        })


        // 开始 每隔 180s 发一封邮件
        intervalMail(newMailList);


    //}, 180 * 1000)
    }, 8 * 1000)

    function intervalMail(list) {

        let mailTimmer = setInterval(() => {

            console.log(`mailList.length: ${list.length}`)


            if (list.length <= 0 ) {
                clearInterval(mailTimmer);
                return;
            }

            let mailItemOp = list.shift();
            sendMail(mailItemOp);

        }, 1 * 1000)
    }

}

function sendMail(maildata) {


  console.log('send email ....')
      console.log(maildata);
  return new Promise((resolve, reject) => {
      // send mail with defined transport object
	sendMailer(
		maildata.from,
		maildata.to,
		maildata.cc,
		maildata.subject,
		maildata.html
	);

  })

}
