/* 
==========================================================================
Upcoming controller
========================================================================== 
*/
(function () {
    'use strict';

    angular
        .module('upcoming')
        .controller('UpcomingController', UpcomingController);
    UpcomingController.$inject = ['$scope', '$routeParams', '$route', '$location', '$timeout', 'httpservice', 'movieservice', 'UtilsService', 'FilterService', 'API_SERVICE_INFO'];

    function UpcomingController($scope, $routeParams, $route, $location, $timeout, httpservice, movieservice, UtilsService, FilterService, API_SERVICE_INFO) {
        var uc = this;

        /**
         * Initialize variables
         */
        uc.allMovies;
        uc.apiInfo = API_SERVICE_INFO;
        uc.errorMessage = '';
        uc.movies;
        uc.movie;
        uc.images;
        uc.isLoading = true;
        uc.isMobile = UtilsService.isMobile();
        if (window.innerWidth < 600 || document.body.clientWidth < 600) {
            uc.isPosterDesign = false;
        } else {
            uc.isPosterDesign = true;
        }
        uc.orderFilter = [];
        uc.tempMovie = [];
        uc.resetButton = false;

        uc.months = [
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

        // Application movie filters
        uc.filters = {
            months: uc.months,
            // Get genres from request data
            genres: [],
            search: ''
        };


        /**
         * Initialize functions
         */
        uc.filter = filter;
        uc.filterToggle = FilterService.filterToggle;
        uc.formatDate = formatDate;
        uc.getMovies = getMovies;
        uc.getMonthId = getMonthId;
        uc.movieInfo = movieInfo;
        uc.initalize = initalize;
        uc.initFilter = initFilter;
        uc.initialFiltering = initialFiltering;
        uc.reset = reset;

        /**
         * Filters movies by query object
         * This is a mini filter state machine
         * First : Prepare the filters and store in state object
         * Second : Set filters in right orderFilter
         * Third : Loop through filter order and filter movies 
         * --------------------------------------
         * @param {query} query object to filter movies
         */
        function filter(query) {
            // Prepare filters and sets state on each filter 
            // Sets dirty to true to indicate that the filter is in use
            // and updates the query object on induvidual filter
            var isDirty = (query.id == 0 || query.id == '') ? false : true;
            switch (query.filter) {
                case 'search':
                    uc.filtersStates.search = { dirty: isDirty, query: query };
                    break;
                case 'months':
                    uc.filtersStates.months = { dirty: isDirty, query: query };
                    break;
                case 'genres':
                    uc.filtersStates.genres = { dirty: isDirty, query: query };
                    break;
            }

            // Run through mini state filtering machine
            // Search        
            if (uc.filtersStates.search.dirty) {
                if (!uc.orderFilter.inArray('search')) {
                    uc.orderFilter.push('search');
                }
            } else {
                uc.orderFilter.removeItem('search');
            }
            // Months        
            if (uc.filtersStates.months.dirty) {
                if (!uc.orderFilter.inArray('months')) {
                    uc.orderFilter.push('months');
                }
            } else {
                uc.orderFilter.removeItem('theaters');
            }
            // Genres
            if (uc.filtersStates.genres.dirty) {
                if (!uc.orderFilter.inArray('genres')) {
                    uc.orderFilter.push('genres');
                }
            } else {
                uc.orderFilter.removeItem('genres');
            }

            // Reset current movie scope with all movies         
            uc.movies = uc.allMovies;

            // Loop through filtering order and filter
            for (var i = 0; i < uc.orderFilter.length; i++) {
                switch (uc.orderFilter[i]) {
                    case 'search':
                        uc.movies = FilterService.filterBySearch(uc.filtersStates.search.query, uc.movies, uc.allMovies);
                        break;
                    case 'months':
                        uc.movies = FilterService.filterByMonths(uc.filtersStates.months.query, uc.movies, uc.allMovies);
                        break;
                    case 'genres':
                        uc.movies = FilterService.filterByGenres(uc.filtersStates.genres.query, uc.movies, uc.allMovies);
                        break;
                }
            }
            var error;
            if (uc.movies.length === 0) {
                uc.resetButton = true;
                uc.errorMessage = 'Engin mynd fannst með þessum leitarskilyrðum.';
            } else {
                uc.errorMessage = '';
            }
        };

        function formatDate(format) {
            var date = new Date(format),
                day = date.getDate(),
                monthIndex = date.getMonth(),
                year = date.getFullYear();
            return {
                isk: day + '.' + uc.months[monthIndex].id + ' ' + year
            };
        }

        function getMovies() {
            var chachedMovies = lscache.get('upcoming');
            if (chachedMovies !== null) {
                uc.allMovies = uc.initialFiltering(chachedMovies);
            } else {
                var errorMsg = 'Ekki tókst að sækja myndir. Reyndu aftur síðar.';
                // Get all movies from servcie
                httpservice.getJson('/data/upcoming.json').then(function (data) {
                    if (data.length > 0) {
                        lscache.set('upcoming', data, 60);
                        uc.allMovies = uc.initialFiltering(data);
                    } else {
                        getDataFromService();
                    }
                }).catch(function (message) {
                    getDataFromService();
                });

                function getDataFromService() {
                    httpservice.getJson(uc.apiInfo.baseUrl + 'upcoming/', uc.apiInfo.token).then(function (data) {
                        if (data.length > 0) {
                            lscache.set('upcoming', data, 60);
                            uc.allMovies = uc.initialFiltering(data);
                        } else {
                            uc.errorMessage = errorMsg;
                        }
                    }).catch(function (message) {
                        uc.errorMessage = errorMsg;
                        uc.isLoading = false;
                    });
                }
            }
        };

        function getMonthId(format) {
            var date = new Date(format),
                monthIndex = date.getMonth();
            return uc.months[monthIndex].id;
        }

        initalize();

        // Initalize
        function initalize() {
            uc.getMovies();
        };

        initFilter();

        // initalize filters
        function initFilter() {
            // Keep state on movie filters
            uc.filtersStates = {
                years: {
                    dirty: false,
                    query: ''
                },
                months: {
                    dirty: false,
                    query: ''
                },
                genres: {
                    dirty: false,
                    query: ''
                },
                search: {
                    dirty: false,
                    query: ''
                }
            }
        };

        function initialFiltering(data) {
            var genres = [];
            angular.forEach(data, function (movie) {
                if (movie['release-dateIS']) {
                    movie['release-date'] = movie['release-dateIS'];
                    movie.monthId = uc.getMonthId(movie['release-dateIS']);
                    movie['release-dateIS'] = uc.formatDate(movie['release-dateIS']).isk;
                }
                if (movie.omdb[0] && movie.omdb[0].Runtime && movie.omdb[0].Runtime != 'N/A') {
                    movie.omdb[0].Runtime = UtilsService.toHoursMinutes(movie.omdb[0].Runtime.replace('min', ''));
                }
                if (movie.genres.length > 0) {
                    for (var g = 0; g < movie.genres.length; g++) {
                        genres.push(movie.genres[g].Name);
                    }
                }

            });
            if (genres.length > 0) {
                genres = genres.sort();
                uc.filters.genres = genres.filter(function () {
                    var seen = {};
                    return function (element, index, array) {
                        if (element) {
                            return !(element in seen) && (seen[element] = 1);
                        }
                    };
                } ());
            }

            // Sort all movies by date
            uc.movies = data.sort(function (a, b) {
                return new Date(a['release-date']) - new Date(b['release-date']);
            });

            uc.isLoading = false;
            return uc.movies;
        };

        /**
         * Resets everything
         */
        function reset() {
            uc.errorMessage = '';
            uc.resetButton = false;
            uc.movies = uc.allMovies;
            uc.orderFilter = [];
            uc.filters.search = '';
            uc.initFilter();
            // Reset all filters
            angular.forEach(document.querySelectorAll('.cs-options ul'), function (ul) {
                angular.forEach(ul.children, function (li) {
                    classie.removeClass(li, 'cs-selected');
                    if (li.getAttribute('data-id') == 0) {
                        classie.addClass(li, 'cs-selected');
                        classie.remove(ul.parentNode.previousSibling, 'active');
                        ul.parentNode.previousSibling.innerHTML = li.getAttribute('data-value');
                    }
                });
            });
        }

        /**
         * Sets current movie into service and sets route to info route
         * --------------------------------------
         * @param {movie} current movie obj
         */
        function movieInfo(movie, event) {
            var animate = !uc.isMobile && uc.isPosterDesign;
            if (animate) {
                var el = event.target;
                var elPos = el.getBoundingClientRect();
                var doc = document.documentElement;
                var docLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
                var docTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

                var newEl = document.createElement('div');
                newEl.className = 'image_animation_loader';
                $('ng-view').append(newEl);

                newEl.style.width = elPos.width + 'px';
                newEl.style.height = elPos.height + 'px';
                newEl.style.left = docLeft + elPos.left + 'px';
                newEl.style.top = docTop + elPos.top + 'px';

                $timeout(function () {
                    classie.addClass(newEl, 'open');
                }, 0);
            }
            $timeout(function () {
                movieservice.setMovie(movie);
                sessionStorage.setItem('fromIndex', true);
                $location.path('/info').search('id', movie['_id']).search('type', 'upcoming');
            }, animate ? 1000 : 0);
        }

        $scope.$on('uiChange', function (targetScope, data) {
            switch (data) {
                case 'LIST':
                    uc.isPosterDesign = false;
                    break;
                case 'POSTER':
                    uc.isPosterDesign = true;
                    break;
            }
            $scope.$apply();
        });

        // On filtering event filter movies
        $scope.$on('filtering', function (event, filterObj) {
            uc.filter(filterObj);
        });
    };

} ());
