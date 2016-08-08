(function () {
    'use strict';
    angular
        .module('movieDetails')
        .controller('MovieDetailsController', MovieDetailsController);

    MovieDetailsController.$inject = ['$scope', '$location', 'movieservice', 'httpservice', 'UtilsService', 'API_SERVICE_INFO'];

    function MovieDetailsController($scope, $location, movieservice, httpservice, UtilsService, API_SERVICE_INFO) {
        var mi = this;

        /**
         * Initialize variables
         */
        mi.apiInfo = API_SERVICE_INFO;
        mi.extraImages;
        mi.movie = movieservice.getMovie();
        mi.errorMessage = '';
        mi.isLoading = true;
        mi.imagesExist = false;
        mi.months = [
            { id: "jan", name: "JANÚAR" },
            { id: "feb", name: "FEBRÚAR" },
            { id: "mars", name: "MARS" },
            { id: "apr", name: "APRÍL" },
            { id: "maí", name: "MAÍ" },
            { id: "jún", name: "JÚNÍ" },
            { id: "júl", name: "JÚLÍ" },
            { id: "ágú", name: "ÁGÚST" },
            { id: "sep", name: "SEPTEMBER" },
            { id: "okt", name: "OKTÓBER" },
            { id: "nóv", name: "NÓVEMBER" },
            { id: "des", name: "DESEMBER" }
        ];

        /**
         * Tabs states
         */
        mi.tabStates = {
            posters: {
                enable: false,
                index: 0,
                chunkLength: 0,
                finished: false
            },
            images: {
                enable: false,
                index: 0,
                chunkLength: 0,
                finished: false
            }

        };

        /**
         * Initialize functions
         */
        mi.changeTime = changeTime;
        mi.filterExtraImages = filterExtraImages;
        mi.formatDate = formatDate;
        mi.getMoviesById = getMoviesById;
        mi.loadImages = loadImages;
        mi.initialize = initialize;
        mi.openPhotoswipe = openPhotoswipe;
        mi.getExtraImages = getExtraImages;

        /**
         * Splits array into chunks of arrays
         */
        function arrayChunks(array, chunkSize) {
            return [].concat.apply([],
                array.map(function (elem, i) {
                    return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
                })
            );
        }

        initialize();

        /**
         * Initialize
         */
        function initialize() {
            // Scroll view on top
            var body = document.querySelector('body');
            body.scrollTop = 0;

            mi.movie = movieservice.getMovie();
            if (mi.movie && mi.movie.ids.imdb) {
                mi.getExtraImages(function () {
                    mi.isLoading = false;
                });
            } else if ($location.search()['id']) {
                mi.getMoviesById($location.search()['id'], function () {
                    if (mi.movie) {
                        mi.getExtraImages(function () {
                            mi.isLoading = false;
                        });
                    } else {
                        mi.isLoading = false;
                    }
                });
            } else {
                mi.errorMessage = 'Engin mynd valin. ';
                mi.isLoading = false;
            }
        };

        /**
         * Load images in chunks (5 at a time)
         */
        function loadImages(type, load) {
            if (!load) {
                var chunkSize = type == 'posters' ? 8 : 6;
                mi.movie[type] = arrayChunks(mi.movie[type], chunkSize);

                mi.tabStates[type].chunkLength = mi.movie[type].length;
                mi.movie[type + 'Chunk'] = mi.movie[type].slice(0, 1)[0];
                if (mi.tabStates[type].chunkLength < 2) {
                    mi.tabStates[type].finished = true;
                }
                $scope.$apply();
            } else {
                if (mi.tabStates[type].index <= mi.tabStates[type].chunkLength - 2) {
                    mi.tabStates[type].index++;
                    var chunks = mi.movie[type].slice(mi.tabStates[type].index, mi.tabStates[type].index + 1);
                    for (var i = 0; i < chunks.length; i++) {
                        for (var j = 0; j < chunks[i].length; j++) {
                            mi.movie[type + 'Chunk'].push(chunks[i][j]);
                        }
                    }
                    // Hide more images button
                    if (mi.tabStates[type].index === mi.tabStates[type].chunkLength - 1) {
                        mi.tabStates[type].finished = true;
                    }
                }
            }
        };

        /**
         * Initialize photoswipe
         */
        function openPhotoswipe(width, height, index, type) {
            var pswpElement = document.querySelectorAll('.pswp')[0],
                merged = mi.movie[type + 'Chunk'];

            // build items array
            var items = [];
            for (var i = 0; i < merged.length; i++) {
                var item = {
                    src: merged[i],
                    w: width,
                    h: height
                };
                items.push(item);
            }

            var options = {
                index: index, // starting slide
                getThumbBoundsFn: function (index) {
                    // find image element
                    var thumbnail;
                    if (type === 'posters') {
                        thumbnail = document.querySelectorAll('.tab_container .movie_container img')[index];
                    } else {
                        thumbnail = document.querySelectorAll('.tab_container .backdrop img')[index];
                    }
                    // get window scroll Y
                    var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                    // get position of element relative to viewport
                    var rect = thumbnail.getBoundingClientRect();
                    return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
                }

            };
            var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        };

        /**
         * Get extra images from service
         */
        function getExtraImages(callback) {
            var id = mi.movie.ids.imdb;
            var imageCached = lscache.get(id);
            if (!imageCached) {
                httpservice.getJson(mi.apiInfo.baseUrl + 'images/?imdbid=tt' + id, mi.apiInfo.token).then(function (data) {
                    if (!data.Message || data && data.length > 0) {
                        mi.filterExtraImages(data);
                        mi.imagesExist = true;
                    } else {
                        mi.movie.images = [];
                        mi.movie.images.push(mi.movie.poster);
                    }
                    callback();
                }).catch(function (message) {
                    console.log('Ekki tókst að sækja auka myndir fyrir ' + mi.movie.title);
                    callback();
                });
            } else {
                if (imageCached.posters) {
                    mi.movie.posters = {};
                    mi.movie.posters = imageCached.posters;
                    mi.imagesExist = true;
                }
                if (imageCached.images) {
                    mi.imagesExist = true;
                    mi.movie.images = [];
                    mi.movie.slides = [];
                    mi.movie.images = imageCached.images;
                    mi.movie.slides = imageCached.images;
                }
                callback();
            }
        };


        /**
         * Filter images from request to images array of urls
         */
        function filterExtraImages(data) {
            var id = mi.movie.ids.imdb;
            angular.forEach(data, function (image) {
                if (image.imdbid && image.results && image.imdbid.indexOf(id) > -1) {
                    var imgObj = {};
                    if (image.results.backdrops) {
                        mi.movie.images = [], mi.movie.slides = [];
                        angular.forEach(image.results.backdrops, function (obj) {
                            mi.movie.images.push('http://image.tmdb.org/t/p/w1920' + obj.file_path);
                        });
                        imgObj.images = mi.movie.images;
                        mi.movie.slides = mi.movie.images;
                    }

                    if (image.results.posters) {
                        mi.movie.posters = [];
                        angular.forEach(image.results.posters, function (obj) {
                            mi.movie.posters.push('http://image.tmdb.org/t/p/w1920' + obj.file_path);
                        });
                        imgObj.posters = mi.movie.posters;
                    }
                    lscache.set(id, imgObj, 60 * 24);
                }
            });
        };

        /**
         * Gets movies from service by id
         */
        function getMoviesById(id, callback) {
            // Get all movies from servcie
            var cachedMovie = lscache.get('movie' + id);
            if (!cachedMovie) {
                if ($location.search()['type']) {
                    httpservice.getJson(mi.apiInfo.baseUrl + $location.search()['type'] + '?mongoid=' + id, mi.apiInfo.token).then(function (data) {
                        var genres = [];
                        if (data.length > 0) {
                            mi.movie = mi.changeTime(data)[0];
                            lscache.set('movie' + id, data, 60);
                            callback();
                        } else {
                            mi.errorMessage = "Mynd fannst ekki.";
                            callback();
                        }
                    }).catch(function (message) {
                        mi.errorMessage = "Ekki tókst að sækja mynd. Reyndu aftur síðar.";
                        callback();
                    });
                }
            } else {
                mi.movie = cachedMovie[0];
                callback();
            }
        };

        /**
         * Changes time to hour minutes format
         */
        function changeTime(data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].durationMinutes) {
                    data[i].durationMinutes = UtilsService.toHoursMinutes(data[i].durationMinutes);
                }
                if (data[i]['release-dateIS']) {
                    data[i]['release-dateIS'] = mi.formatDate(data[i]['release-dateIS']).isk;
                }
            }
            return data
        };

        /**
         * Formats date by icelandic months
         */
        function formatDate(format) {
            var date = new Date(format),
                day = date.getDate(),
                monthIndex = date.getMonth(),
                year = date.getFullYear();
            return {
                isk: day + '.' + mi.months[monthIndex].id + ' ' + year
            };
        }

        /**
         * Event listener when tab changes
         */
        $scope.$on('tabData', function (e, id) {
            switch (id.toLowerCase()) {
                case 'images':
                    if (!mi.tabStates.images.enable) {
                        mi.movie.imagesChunk = [];
                        mi.loadImages('images', null);
                        mi.tabStates.images.enable = true;
                    }
                    break;
                case 'posters':
                    if (!mi.tabStates.posters.enable) {
                        mi.movie.postersChunk = [];
                        mi.loadImages('posters', null);
                        mi.tabStates.posters.enable = true;
                    }
                    break;
                case 'trailers':
                    break;
            }
        });
    };
} ());