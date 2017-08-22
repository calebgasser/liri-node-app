var keys = require('./keys');
var request = require('request');
var Spotify = require('node-spotify-api');

var command = process.argv[2];
var input = process.argv[3];
var spotify = new Spotify({
  id: '46a0a46dddc34fc8b0eee091681b5116',
  secret: 'a340e7f621994effb5b8ba1b278f62bd'
});

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
      for (message in messages) {
        console.log(messages[message].created_at);
        console.log(messages[message].text + '\n\n');
      }
    })
  })
}

var spotifyThisSong = function(song) {
  if (!song) {
    song = 'The Sign'
  }
  spotify.search({
    type: 'track',
    query: song,
    limit: 1
  }).then(function(data) {
    var trackData = data.tracks.items[0];
    for (obj in trackData) {
      if (obj === 'artists') {
        for (artist in trackData[obj]) {
          console.log('Artist: ' + trackData[obj][artist].name);
        }
      }
      if (obj === 'name') {
        console.log('Song Name: ' + trackData[obj]);
      }
      if (obj === 'album') {
        console.log('Album: ' + trackData[obj].name);
      }
      if (obj === 'external_urls') {
        console.log('Link: ' + trackData[obj].spotify);
      }
    }
  }).catch(function(err) {
    console.log(err);
  })
}

var movieThis = function(movie) {
  if(!movie){
    movie = 'Mr. Nobody';
  }
  request('http://www.omdbapi.com/?apikey=40e9cece&t=' + movie,function(err, res, body){
    let data = JSON.parse(body);
    if(data.Response !== 'False'){
      console.log('Title: ' + data.Title);
      console.log('Year: ' + data.Year);
      for(rating in data.Ratings){
        if(data.Ratings[rating].Source === 'Rotten Tomatoes'){
          console.log('Rotten Tomatoes: ' + data.Ratings[rating].Value);
        }
        if(data.Ratings[rating].Source === 'Internet Movie Database'){
          console.log('IMDB: ' + data.Ratings[rating].Value);
        }
      }
      console.log('Country: ' + data.Country);
      console.log('Language: ' + data.Language);
      console.log('Plot: ' + data.Plot);
      console.log('Actors: ' + data.Actors);
    } else {
      console.log(data.Error);
    }
  })
}

var doWhatItSays = function() {

}

switch (command) {
  case 'my-tweets':
    myTweets();
    break;
  case 'spotify-this-song':
    spotifyThisSong(input);
    break;
  case 'movie-this':
    movieThis(input);
    break;
  case 'do-what-it-says':
    doWhatItSays(input);
    break;
  default:
    break;
}
