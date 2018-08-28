/* global module */
var child_process = require('child_process');
var log4js = require('log4js');
var logger = log4js.getLogger();
const to_f3 = require('@txxxnt/to_f').to_f3;

global.pjconfig = require(path.join(__dirname, '../project.json'))
const emailConfig = global.pjconfig.email

to_f3.config({
    appKey: emailConfig.to_f3_appkey,
    sysId: emailConfig.to_f3_id
});


to_f3.setIDC();
to_f3.promise();

var wrap = function(str){
    return ["'", (str || '').toString().replace(/'/g, '"').replace(/[\r\n]/g, ''), "'"].join('');
};

var fixMail = function(emails){
    if (!Array.isArray(emails)) {
        return '';
    }

    var output = [];
    emails.forEach(function(v){
        var name = (v || '').toString().replace(/@[\w\W]*$/, '');
        name && output.push(name);
    });

    return output.join(";");
};


module.exports = function(from, to, cc, title, content, a) {
    logger.info("Send email " + title);

    const param = {
        "From": from,
        "To": to,
        "CC": cc,
        "Bcc": "",
        "Title": title,
        "Content": content,
        "EmailType": 1,
        "BodyFormat": 1,
        "Priority": 1
    };

    logger.info(param);

    to_f3.message.sendMail(param).then((result) => {
        logger.info('sendMail result: ${result}', {
            result:result._tofBody
        })
    }).catch((err) => {
        logger.info('sendMail err: ${err}', {
            err: err
        })
    })
};
