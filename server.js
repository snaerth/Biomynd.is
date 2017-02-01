"use strict";
var express = require('express');
var compression = require('compression');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var CronJob = require('cron').CronJob;
var q = require('q');
var fs = require('fs');
var request = require('request');
var dateFormat = require('dateformat');
var app = express();
require('dotenv').config();

var token = '';
var apiBaseUrl = 'http://api.kvikmyndir.is/';

runFetchTokenTask();

// Gets token from api
function fetchToken(url, username, password) {
    var deferred = q.defer();
    request.post(url, {
        form: {
            username: username,
            password: password
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            deferred.resolve(body);

        } else {
            deferred.reject(error);
        }
    });
    return deferred.promise;
};

// 
function runFetchTokenTask() {
    fetchToken('http://api.kvikmyndir.is/authenticate', process.env.API_USERNAME, process.env.API_PASSWORD).then(function (data) {
        var response = JSON.parse(data);
        if (response.success && response.token) {
            token = response.token;
        }
    });
}

// Task for renewing token that runs every 6 hours
new CronJob('0 */3 * * *', function () {
    runFetchTokenTask();
}, null, true, 'Atlantic/Reykjavik');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// New call to compress content
app.use(compression());
app.use(favicon(path.join(__dirname, 'public/favicon', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res, next) {
    res.setHeader('Cache-Control', 'public, max-age=80000');
    res.render('index', {
        api: {
            token: token,
            baseUrl: apiBaseUrl
        }
    });
});

app.get('*', function (req, res, next) {
    res.setHeader('Cache-Control', 'public, max-age=80000');
    res.render('index', {
        api: {
            token: token,
            baseUrl: apiBaseUrl
        }
    });
});

app.listen(4000);

module.exports = app;
