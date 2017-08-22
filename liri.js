var keys = require('./keys');
var request = require('request');

var command = process.argv[2];
var input = process.argv[3];

var myTweets = function() {
  let baseUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json?';
  let userId = 'screen_name=LiriBotter&';
  let count = 'count=20';
  let urlFinal = baseUrl + userId + count;
  let auth = new Buffer(keys.twitterKeys.consumer_key + ':' + keys.twitterKeys.consumer_secret).toString('base64');
  request.post({
    url: 'https://api.twitter.com/oauth2/token',
    headers: {
      "Authorization": 'Basic ' + auth,
      "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: 'grant_type=client_credentials'
  }, function(err, res, body) {
    if (err) {
      console.log(err);
      return;
    }
    let accessT = JSON.parse(res.body).access_token;
    request({
      url: urlFinal,
      headers: {
        Authorization: 'Bearer ' + accessT
      }
    }, function(err, res, body) {
      if (err) {
        console.log(err)
        return;
      }
      messages = JSON.parse(body)
      for(message in messages){
        console.log(messages[message].created_at);
        console.log(messages[message].text + '\n\n');
      }
    })
  })
}

var spotifyThisSong = function() {

}

var movieThis = function() {

}

var doWhatItSays = function() {

}

switch (command) {
  case 'my-tweets':
    myTweets();
    break;
  case 'spotify-this-song':
    spotifyThisSong();
    break;
  case 'movie-this':
    movieThis();
    break;
  case 'do-what-it-says':
    doWhatItSays();
    break;
  default:
    break;
}
