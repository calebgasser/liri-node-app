var keys = require('./keys');
var request = require('request');
var Spotify = require('node-spotify-api');
var fs = require('fs');

var command = process.argv[2];
var input = process.argv[3];
var spotify = new Spotify({
  id: '46a0a46dddc34fc8b0eee091681b5116',
  secret: 'a340e7f621994effb5b8ba1b278f62bd'
});

var log = function(data){
  var newData = {
    command: command,
    output: data
  }
  if(input){
    newData.command += (' ' + input);
  }
  fs.appendFile('./log.txt', JSON.stringify(newData) + '\n', (err)=>{
    if(err){
      console.log(err);
    }
  })
}

var myTweets = function() {
  var output = '';
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
        output += messages[message].created_at + '\n';
        output += messages[message].text + '\n';
      }
      console.log(output);
      log(output);
    })
  })
}

var spotifyThisSong = function(song) {
  var output = '';
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
          output += 'Artist: ' + trackData[obj][artist].name + '\n';
        }
      }
      if (obj === 'name') {
        output += 'Song Name: ' + trackData[obj] + '\n';
      }
      if (obj === 'album') {
        output += 'Album: ' + trackData[obj].name + '\n';
      }
      if (obj === 'external_urls') {
        output += 'Link: ' + trackData[obj].spotify + '\n';
      }
    }
    console.log(output);
    log(output);
  }).catch(function(err) {
    console.log(err);
  })
}

var movieThis = function(movie) {
  if(!movie){
    movie = 'Mr. Nobody';
  }
  request('http://www.omdbapi.com/?apikey=' + keys.ombdKeys.api_key +'&t=' + movie,function(err, res, body){
    var output = '';
    let data = JSON.parse(body);
    if(data.Response !== 'False'){
      output += 'Title: ' + data.Title + '\n';
      output += 'Year: ' + data.Year + '\n';
      for(rating in data.Ratings){
        if(data.Ratings[rating].Source === 'Rotten Tomatoes'){
          output += 'Rotten Tomatoes: ' + data.Ratings[rating].Value + '\n';
        }
        if(data.Ratings[rating].Source === 'Internet Movie Database'){
          output += 'IMDB: ' + data.Ratings[rating].Value + '\n';
        }
      }
      output += 'Country: ' + data.Country + '\n';
      output += 'Language: ' + data.Language + '\n';
      output += 'Plot: ' + data.Plot + '\n';
      output += 'Actors: ' + data.Actors + '\n';
      console.log(output);
      log(output);
    } else {
      console.log(data.Error);
    }
  })
}

var doWhatItSays = function() {
  fs.readFile('./random.txt', 'utf8', (err, data)=>{
    commands = data.split('\n');
    for(com in commands){
      var currentCommand = '';
      var input = '';
      var line = commands[com].trim('\r');
      if(line.includes(' ')){
        currentCommand = line.substr(0, line.indexOf(' '));
        input = line.substr(line.indexOf(' ') + 1);
      } else {
        currentCommand = line;
      }
      runCommand(currentCommand, input);
    }
  })
}

var runCommand = function(com, inp){
  switch (com) {
    case 'my-tweets':
      myTweets();
      break;
    case 'spotify-this-song':
      spotifyThisSong(inp);
      break;
    case 'movie-this':
      movieThis(inp);
      break;
    case 'do-what-it-says':
      doWhatItSays(inp);
      break;
    default:
      break;
  }
}

runCommand(command, input);
