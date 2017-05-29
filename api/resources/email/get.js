var mandrill = require('mandrill-api/mandrill');
var mandrill_key = process().env.MANDRILL_KEY;
var mandrill_client = new mandrill.Mandrill(mandrill_key);
var fs = require('fs');
var path = require('path');
var async = require('async');
var moment = require('moment');
var _ = require('underscore');

$addCallback();

function getDay(timestamp) {

  return moment(timestamp, 'X').format('YYYY-MM-DD');
}

function fullDate(t) {
  return moment.unix(t).format('MMM D, YYYY @ HH:mm:ss');
}

function messageDate(t) {
  return moment.unix(t).format('h:mm a');
}
var md = {};
var messageData;
var HTML;
var chatUrl;

if(ctx.query.booking!==''){
  chatUrl= process().env.BASE_URL + 'booking/'+ ctx.query.booking+'/contact';
}else if(ctx.query.property!==''){
  chatUrl= process().env.BASE_URL + 'property/'+ ctx.query.property+'///contact';
}else{
  chatUrl= process().env.BASE_URL + 'contact/';
}
var EmailData = {
  BASE_URL: process().env.BASE_URL,
  BASE_URL_ASSETS: process().env.BASE_URL_ASSETS,
  CHAT_URL:chatUrl
};

dpd.emails.get({
  value: {
    $in: ['base', 'message']
  }
}, function (data) {
  HTML = _.findWhere(data, {
    value: 'message'
  }).html;
  var translation = require(path.resolve(path.dirname()) + '/public/translations/' + ctx.query.language + '.json');

  dpd.getmessage.get({
    id: ctx.query.message
  }, function (message) {
    messageData = message;

    md.NAME = message.user.name;
    var MessageHTML = '';
    var currentDay;
    message.messages = _.sortBy(message.messages, 'date');
    async.each(message.messages, function (m, callback) {
      var intHTML = '';

      var link = '';

      if (!m.manager) {
        var prelink = '';
        var contact = '/contact//';
        if (message.user.type === 'agent') {
          prelink = 'agent';
          contact = 'agent/chat/';
        }
        var linkType = m.booking && m.booking.id || m.property && m.property.unique || 'Contact Form';
        link = '<p style="position: absolute;bottom:0;right: 0;width: 75px;font-size: 10px;color: green !important;">' + linkType + '</p>';
      }
      
      intHTML += '<div>';

//      if (currentDay !== getDay(m.date)) {
//        intHTML += '<p style="font-size: 12px;text-align: center;margin-bottom: -15px;">' + fullDate(m.date) + '</p><div style="height: 1px;width: 100%;float: left;margin: 15px auto;background: #ccc;clear: both;"></div><div style="clear:both"></div>';
//      }

      if (m.manager) {
        intHTML += '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td><table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td width="60" style="font-family: arial,sans-serif;">' + messageDate(m.date) + '</td><td><table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td><table border="0" cellspacing="0" cellpadding="0" width="464"><tr valign="bottom" height="14" style="margin:0px;padding:0px;"><td style="margin:0px;padding:0px;" valign="bottom" height="14"><img style="display:block;" src="{{BASE_URL_ASSETS}}assets/images/green-top.png" alt="" /></td></tr><tr width="454"><td><table border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color: #BEF18C;"><tr width="464"><td width="454"><table border="0" cellspacing="0" cellpadding="0" width="454"><tr><td width="10"></td><td style="font-family: arial,sans-serif;">' + m.message + '</td></tr></table><img style="display:block;width:454px;" width="454" src="{{BASE_URL_ASSETS}}assets/images/green-bottom.png" alt="" /></td><td style="background-color:#fff" width="10"></td></tr></table></td><td width="10"></td></tr></table></td><td></td></tr></table></td></tr></table></td></tr><tr height="20"></tr></table>';
      } else {
        intHTML += '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td><table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td><table border="0" cellspacing="0" cellpadding="0" width="464"><tr valign="bottom" height="14" style="margin:0px;padding:0px;"><td style="margin:0px;padding:0px;" valign="bottom" height="14"><img style="display:block;" src="{{BASE_URL_ASSETS}}assets/images/gray-top.png" alt="" /></td></tr><tr width="454" style="background-color: #E4E8EB;"><td><table border="0" cellspacing="0" cellpadding="0" width="100%"><tr width="464"><td style="background-color:#fff" width="10"></td><td width="454"><table border="0" cellspacing="0" cellpadding="0" width="454"><tr><td width="10"></td><td style="font-family: arial,sans-serif;">' + m.message + '</td></tr></table><img style="display:block;width:454px;" width="454" src="{{BASE_URL_ASSETS}}assets/images/gray-bottom.png" alt="" /></td></tr></table></td></tr></table></td><td width="60"><table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td style="font-family: arial,sans-serif;">' + messageDate(m.date) + '</td></tr></table></td></tr></table></td></tr><tr><td height="20"></td></tr></table>';
      }
      
      currentDay = getDay(m.date);
      MessageHTML += intHTML;
      callback();
    }, function () {
      if (messageData.user.type === 'tenant') {
        EmailData.CONTACT_URL = 'autologin/' + new Buffer(messageData.user.email).toString('base64') + '/';
      } else {
        EmailData.CONTACT_URL = 'agent/chat/';
      }
      HTML = HTML.replace('{{CHAT}}', MessageHTML);
      HTML = HTML.replace('{{NAME}}', messageData.user.name);

      _.each(EmailData, function (v, k) {
        HTML = HTML.replace(new RegExp('{{' + k + '}}', 'g'), v);
      });
      _.each(translation, function (v, k) {
        HTML = HTML.replace(new RegExp('\\[\\[' + k + '\\]\\]', 'gim'), v);
      });
      
      var message = {
        "html": HTML,
        "subject": 'ThaiHome: You have a new message from Note',
        "from_email": "note@thaihome.co.uk",
        "from_name": "ThaiHome",
        "to": [{
          "email": messageData.user.email,
          "type": "to"
				}],
        "headers": {

        },
        "important": true
      };
      var async = true;
      var ip_pool = "Main Pool";
      mandrill_client.messages.send({
        "message": message,
        "async": async,
        "ip_pool": ip_pool
      }, function (mailResult) {
        setResult(mailResult);
        $finishCallback();
      });
    });

  });
});
