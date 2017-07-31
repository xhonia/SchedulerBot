var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var WebClient = require('@slack/client').WebClient;
var axios = require('axios')

/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */
var rtmToken = process.env.SLACK_API_TOKEN || '';
var webToken = process.env.SLACK_API_TOKEN || ''; //see section above on sensitive data

var rtm = new RtmClient(rtmToken);
var web = new WebClient(webToken);
let channel;
// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
	  if (c.name === 'general') { channel = c.id }
  }

  web.chat.postMessage(channel, 'Hello there', function(err, res) {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Message sent interactive: ', res);
    }
  })

  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
})

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  rtm.sendMessage("SchedulerBot at your service!", channel);
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('MESSAGE', message);
  axios({
    method: 'post',
    url: 'https://api.api.ai/v1/query?v=20150910',
    headers: {
      "Authorization": "Bearer a53d802617124f92b9a6d63c76dd2d08",
      "Content-Type": "application/json; charset=utf-8"
    },
    data: {
      query: message.text,
      // context: [{
      //     name: "weather",
      //     lifespan: 4
      // }],
      // location: {
      //     latitude: 37.459157,
      //     longitude: -122.17926
      // },
      // timezone: "America/New_York",
      lang: "en",
      sessionId: message.user
    }
  })
  .then(function (response) {
    console.log('DATA', response);
    rtm.sendMessage(response.data.result.fulfillment.speech, message.channel);
  })
  .catch(function (error) {
    console.log(error);
  });
});

// rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
//   console.log('Reaction added:', reaction);
// });
// rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
//   console.log('Reaction removed:', reaction);
// });

module.exports = {
  rtm,
  web
};
