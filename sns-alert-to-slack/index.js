// This code design by wansatriaandanu
var https = require('https');
var util = require('util');

exports.handler = function(event, context) {
  console.log(JSON.stringify(event, null, 2));
  console.log('From SNS:', event.Records[0].Sns.Message);

  var postData = {
    "channel": "#yourslackchannel",
    "username": "AWS SNS Alert",
    "text": "*" + event.Records[0].Sns.Subject + "*",
    "icon_emoji": ":information_source:",
    "link_names": 1
  };

  var message = event.Records[0].Sns.Message;
  var severity = "good";
  var noticeEmoji = ":white_check_mark:";
  var mention = "";

  var dangerMessages = [
    " but with errors",
    " to RED",
    "During an aborted deployment",
    "Failed to deploy application",
    "Failed to deploy configuration",
    "has a dependent object",
    "is not authorized to perform",
    "Pending to Degraded",
    "Stack deletion failed",
    "Unsuccessful command execution",
    "You do not have permission",
    "Your quota allows for 0 more running instance",
    "ELB health is failing",
    "not available",
    "to Severe",
    "to Degraded"
  ];

  var warningMessages = [
    " aborted operation.",
    " to YELLOW",
    "Adding instance ",
    "Degraded to Info",
    "Deleting SNS topic",
    "is currently running under desired capacity",
    "Ok to Info",
    "Ok to Warning",
    "Pending Initialization",
    "Removed instance ",
    "Rollback of environment",
    "to Warning"
  ];

  for(var dangerMessagesItem in dangerMessages) {
    if (message.indexOf(dangerMessages[dangerMessagesItem]) != -1) {
      severity = "danger";
      noticeEmoji = ":bangbang:"
      mention = "@channel "
      break;
    }
  }

  // Only check for warning messages if necessary
  if (severity == "good") {
    for(var warningMessagesItem in warningMessages) {
      if (message.indexOf(warningMessages[warningMessagesItem]) != -1) {
        severity = "warning";
        noticeEmoji = ":warning:"
        break;
      }
    }
  }

  postData.attachments = [
    {
      "color": severity,
      "text": mention + noticeEmoji + message
    }
  ];

  var options = {
    method: 'POST',
    hostname: 'hooks.slack.com',
    port: 443,
    path: '/services/your_slack_url'
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      context.done(null);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write(util.format("%j", postData));
  req.end();
};
