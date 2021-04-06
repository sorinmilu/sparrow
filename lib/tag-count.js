'use strict';

var async = require('async');
var Twit = require('twit');
require('date-util');

var TagCount = function (options) {
  var self = this;

  self.T = new Twit({
    consumer_key: options.consumer_key,
    consumer_secret: options.consumer_secret,
    access_token: options.access_token,
    access_token_secret: options.access_token_secret,
    timeout_ms: options.timeout,
  });

  self.connected = false;
  self.firstConnection = true;
  self.lostConnection = false;

  self.startDate = Date.now();
  self.sumar = {};
  self.results = {};
  self.twcount = 0;
  self.intervalcount = 0;
  self.langs = {};
  self.countries = {};

};

TagCount.prototype.stop = function () {
  var self = this;
  if (self.stream) {
    self.stream.stop();
    self.error = 'Stopped by user';
    self.startDate = Date.now();
    self.sumar = {};
    self.results = {};
    self.twcount = 0;
    self.langs = {};
    self.countries = {};
    self.connected = false;
    self.firstConnection = true;
    self.lostConnection = false;
  }
};

TagCount.prototype.start = function (settings) {
  var self = this;
  self.tagsarray = settings.tagsarray.slice(0);
  self.prefixedtagsarray = [];
  self.twcount = 0;
  self.tagsarray.forEach(function (element) {
    self.prefixedtagsarray.push('#' + element);
  });
  self.cleanCount();
  // Convert date string offset to seconds.
  var date1 = new Date();
  var date2 = date1.strtotime(settings.interval);
  self.interval = (date2.getTime() - date1.getTime()) / 1000;

  var optionalSettings = [
    'limit',
    'intervalCb',
    'finishedCb',
    'connectingCb',
    'reconnectingCb',
    'connectedCb'
  ];

  optionalSettings.forEach(function (element) {
    if (settings[element] !== undefined) {
      self[element] = settings[element];
    }
  });

  //obtine obiectul stream din pachetul Twit prin definirea unui stream filtrat

  self.stream = self.T.stream('statuses/filter', {
    track: self.prefixedtagsarray
  });

  //definirea evenimentelor care sunt apelate de stream in diverse situatii
  self.stream.on('parser-error', function (err) {
    self.error = err;
  });

  self.stream.on('connect', function () {
    if (self.firstConnection === true) {
      if (self.connectingCb !== undefined) {
        self.connectingCb();
      }
      self.firstConnection = false;
    }
  });

  self.stream.on('reconnect', function () {
    if (self.lostConnection === false && self.firstConnection === false) {
      if (self.reconnectingCb !== undefined) {
        self.reconnectingCb();
      }
      self.lostConnection = true;
    }
    self.connected = false;
  });

  self.stream.on('connected', function () {
    if (self.connectedCb !== undefined) {
      self.connectedCb();
    }
    self.connected = true;
    self.lostConnection = false;
  });

  self.stream.on('error', function (err) {
    console.error(err);
  });

  self.stream.on('tweet', function (tweet) {
    //aceasta functie primeste tweeturile, unul cate unul
    self.processTweet(tweet);
  });

  //async.until executa functia anonima pana cand aceasta returneaza false
  //async.until asteapta trei functii ca parametru:
    //functia test - functia care determina continuarea sau oprirea
    //functia care va fi executata asincron
    //functia care va fi executata la terminare (callback)
  async.until(
    function () {
      if (self.error !== undefined) {
        return true;
      } else if (self.limit !== undefined) {
        var currentDate = new Date();
        var negateLimit = '-' + self.limit;
        var offsetDate = currentDate.strtotime(negateLimit);
        return offsetDate > self.startDate;
      } else {
        return false;
      }
    },
    function (next) {
      self.fillInterval(next);
    },
    function () {
      //transfera controlul functiei callback provenita din apelul clientului
      //daca aceasta este definita, trimitand eroarea sau rezultatele, dupa caz
      if (self.finishedCb !== undefined) {
        if (self.error !== undefined) {
          self.finishedCb(self.error, null);
        } else {
          self.finishedCb(null, self.results);
        }
      }

      self.stream.stop();
    }
  );
};

TagCount.prototype.fillInterval = function (next) {
  var self = this;
  //initializeaza numaratoarea pe intervalul curent
  self.cleanCount();

  //se va executa peste un timp calculat prin self.interval * 1000
  setTimeout(function () {
    if (self.connected === true) {
      if (self.intervalCb !== undefined) {
        if (self.error !== undefined) {
          self.intervalCb(self.error, null, self.twcount, null);
        } else {
          //aici sunt trimise rezultatele intervalului
          self.intervalCb(null, self.sumar, self.twcount, self.langs, self.intervalcount);
        }
      }
    }
    next();
  }, self.interval * 1000);
};

TagCount.prototype.cleanCount = function () {
  var self = this;
  self.tagsarray.forEach(function (term) {
    self.sumar[term] = 0;
  });
  self.intervalcount = 0;
};

//aceasta functie primeste un tweet, extrage tagurile din el si le acumuleaza
TagCount.prototype.processTweet = function (tweet) {
  var self = this;
  var rawTags = [];
  var allTags = [];

  //aici vedem tweeturile
  //console.log(tweet);

  self.twcount++;
  self.intervalcount++;
  if (tweet.lang) {
    if (self.langs.hasOwnProperty(tweet.lang)) {
      self.langs[tweet.lang] += 1;
    } else {
      self.langs[tweet.lang] = 1;
    }
  }
  //textul tweetului
  //console.log(tweet.text);
  // localizarea - din pacate este foarte rara pentru a putea face ceva cu ea
  // console.log(tweet.place);

  //hashtagurile se gasesc in patru posibile locuri:

  // tweet.entities.hashtags
  rawTags.push(tweet.entities.hashtags);

  //tweet.retweeted_status.entities.hashtags daca este un retweet
  if (tweet.retweeted_status !== undefined) {
    rawTags.push(tweet.retweeted_status.entities.hashtags);
  // tweet.retweeted_status.extended_tweet.entities.hashtags daca este un retweet cu extended text
    if (tweet.retweeted_status.extended_tweet !== undefined) {
      rawTags.push(tweet.retweeted_status.extended_tweet.entities.hashtags);
    }
  }

  // tweet.quoted_status.entities.hashtags daca tweetul include o citare a unui alt tweet
  if (tweet.quoted_status !== undefined) {
    rawTags.push(tweet.quoted_status.entities.hashtags);
  }

  //toate tagurile au fost copiate in rawTags dar acesta are o structura prea complicata pentru
  //a trece prin ea de mai multe ori

  //copiaza tagurile din toate sursele intr-un array simplu (allTags)
  rawTags.forEach(function (source) {
    if (source !== undefined) {
      var newtagsarray = source.map(function (hashtagObj) {
        return hashtagObj.text.toLowerCase();
      });
      allTags = allTags.concat(newtagsarray);
    }
  });

  //verifica daca tagurile cautate exista in tagurile acumulate din tweet
  //self.sumar va contine un sumar al numarului de aparitii ale fiecarui tag

  self.tagsarray.forEach(function (tag) {
    var searchTerm = tag.toLowerCase();
    if (allTags.indexOf(searchTerm) !== -1) {
      self.sumar[tag] += 1;
    }
  });
};

module.exports = TagCount;
