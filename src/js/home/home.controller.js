/* 
==========================================================================
Now playing controller
========================================================================== 
*/
(function () {
    'use strict';

    angular
        .module('home')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', '$routeParams', '$route', '$location', '$timeout', 'httpservice', 'UtilsService', 'FilterService', 'API_SERVICE_INFO', 'movieservice'];

    function HomeController($scope, $routeParams, $route, $location, $timeout, httpservice, UtilsService, FilterService, API_SERVICE_INFO, movieservice) {
        var vm = this;
        /**
         * Initialize variables
         */
        vm.apiInfo = API_SERVICE_INFO;
        vm.movies;
        vm.images;
        vm.extraImages;
        vm.allMovies;
        vm.tempMovie = [];
        vm.theaters = "";
        vm.isLoading = true;
        vm.day = $routeParams.day;
        if(!vm.day) vm.day = 0;
        vm.errorMessage = "";
        vm.isMobile = UtilsService.isMobile();

        var sessionIsPosterDesign = sessionStorage.getItem('isPosterDesign');
        sessionIsPosterDesign = JSON.parse(sessionIsPosterDesign);
        if (window.innerWidth < 600 || document.body.clientWidth < 600) {
            vm.isPosterDesign = sessionIsPosterDesign !== null ? sessionIsPosterDesign : false;
        } else {
            vm.isPosterDesign = sessionIsPosterDesign !== null ? sessionIsPosterDesign : true;
        }
        vm.resetButton = false;
        vm.orderFilter = [];

        // Application movie filters
        vm.filters = {
            theaters: function () {
                // Get theaters
                if (lscache.get('theaters') !== null) {
                    return lscache.get('theaters');
                } else {
                    httpservice.getJson('data/theaters.json').then(function (data) {
                        vm.filters.theaters = data;
                        lscache.set('theaters', data);
                        return data;
                    }).catch(function (message) {
                        vm.errorMessage = "Ekki tókst að sækja kvikmyndahús. Reyndu aftur síðar.";
                        return;
                    });
                }
            } (),
            certificates: [
                { name: '16 ára', id: '16' },
                { name: '12 ára', id: '12' },
                { name: '9 ára', id: '9' },
                { name: '6 ára', id: '6' },
                { name: 'Leyfð öllum', id: 'L' }
            ],
            showtimes: [
                { id: '23:00' },
                { id: '22:00' },
                { id: '21:00' },
                { id: '20:00' },
                { id: '19:00' },
                { id: '18:00' },
                { id: '17:00' },
                { id: '16:00' },
                { id: '15:00' },
                { id: '14:00' },
                { id: '13:00' },
            ],
            // Get genres from request data
            genres: [],
            mixed: [
                { id: 1, name: 'Hæsta einkunn' },
                { id: 2, name: 'Lægsta einkunn' },
                { id: 3, name: 'A - Ö' },
                { id: 4, name: 'Ö - A' },

            ],
            search: ''
        };

        /**
         * Initialize functions
         */
        vm.filter = filter;
        vm.filterToggle = FilterService.filterToggle;
        vm.getDataFromService = getDataFromService;
        vm.movieInfo = movieInfo;
        vm.initalize = initalize;
        vm.initFilter = initFilter;
        vm.initialFiltering = initialFiltering;
        vm.reset = reset;

        initFilter();
        /**
         * Initalize filters
         */
        function initFilter() {
            // Keep state on movie filters
            vm.filtersStates = {
                theaters: {
                    dirty: false,
                    query: ''
                },
                showtimes: {
                    dirty: false,
                    query: ''
                },
                certificate: {
                    dirty: false,
                    query: ''
                },
                genres: {
                    dirty: false,
                    query: ''
                },
                mixfilter: {
                    dirty: false,
                    query: ''
                },
                search: {
                    dirty: false,
                    query: ''
                }
            }
        };

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
                    vm.filtersStates.search = { dirty: isDirty, query: query };
                    break;
                case 'theaters':
                    vm.filtersStates.theaters = { dirty: isDirty, query: query };
                    break;
                case 'certificate':
                    vm.filtersStates.certificate = { dirty: isDirty, query: query };
                    break;
                case 'showtimes':
                    vm.filtersStates.showtimes = { dirty: isDirty, query: query };
                    break;
                case 'genres':
                    vm.filtersStates.genres = { dirty: isDirty, query: query };
                    break;
                case 'mixfilter':
                    vm.filtersStates.mixfilter = { dirty: true, query: query };
                    break;
            }

            // Run through mini state filtering machine
            // Search        
            if (vm.filtersStates.search.dirty) {
                if (!vm.orderFilter.inArray('search')) {
                    vm.orderFilter.push('search');
                }
            } else {
                vm.orderFilter.removeItem('search');
            }
            // Theaters        
            if (vm.filtersStates.theaters.dirty) {
                if (!vm.orderFilter.inArray('theaters')) {
                    vm.orderFilter.push('theaters');
                }
            } else {
                vm.orderFilter.removeItem('theaters');
            }
            // Certificates
            if (vm.filtersStates.certificate.dirty) {
                if (!vm.orderFilter.inArray('certificate')) {
                    vm.orderFilter.push('certificate');
                }
            } else {
                vm.orderFilter.removeItem('certificate');
            }
            // Showtimes
            if (vm.filtersStates.showtimes.dirty) {
                if (!vm.orderFilter.inArray('showtimes')) {
                    vm.orderFilter.push('showtimes');
                }
            } else {
                vm.orderFilter.removeItem('showtimes');
            }
            // Genres
            if (vm.filtersStates.genres.dirty) {
                if (!vm.orderFilter.inArray('genres')) {
                    vm.orderFilter.push('genres');
                }
            } else {
                vm.orderFilter.removeItem('genres');
            }
            // Mixed filters
            if (vm.filtersStates.mixfilter.dirty) {
                if (!vm.orderFilter.inArray('mixfilter')) {
                    vm.orderFilter.push('mixfilter');
                }
            } else {
                vm.orderFilter.removeItem('mixfilter');
            }

            // Reset current movie scope with all movies         
            vm.movies = vm.allMovies;

            // Loop through filtering order and filter
            for (var i = 0; i < vm.orderFilter.length; i++) {
                switch (vm.orderFilter[i]) {
                    case 'search':
                        vm.movies = FilterService.filterBySearch(vm.filtersStates.search.query, vm.movies, vm.allMovies);
                        break;
                    case 'theaters':
                        vm.movies = FilterService.filterByTheaters(vm.filtersStates.theaters.query, vm.movies, vm.allMovies);
                        break;
                    case 'certificate':
                        vm.movies = FilterService.filterByCertificate(vm.filtersStates.certificate.query, vm.movies, vm.allMovies);
                        break;
                    case 'showtimes':
                        vm.movies = FilterService.filterByShowtimes(vm.filtersStates.showtimes.query, vm.movies, vm.allMovies);
                        break;
                    case 'genres':
                        vm.movies = FilterService.filterByGenres(vm.filtersStates.genres.query, vm.movies, vm.allMovies);
                        break;
                    case 'mixfilter':
                        vm.movies = FilterService.mixedFilter(vm.filtersStates.mixfilter.query, vm.movies, vm.allMovies);
                        break;
                }
            }
            var error;
            if (vm.movies.length === 0) {
                vm.resetButton = true;
                vm.errorMessage = "Engin mynd fannst með þessum leitarskilyrðum.";
            } else {
                vm.errorMessage = '';
            }
        };

        function getDataFromService() {
            // Get all movies from servcie
            httpservice.getJson(vm.apiInfo.baseUrl + 'movies-by-dates/' + vm.day, vm.apiInfo.token).then(function (data) {
                if (data.length > 0) {
                    data = vm.initialFiltering(data);
                } else {
                    vm.errorMessage = 'Ekki tókst að sækja myndir að svo stöddu.';
                }
            }).catch(function (message) {
                vm.errorMessage = 'Ekki tókst að sækja myndir að svo stöddu.';
                vm.isLoading = false;
            });
        }

        /**
         * Sets current movie into service and sets route to info route
         * --------------------------------------
         * @param {movie} current movie obj
         */
        function movieInfo(movie, event) {
            var animate = !vm.isMobile && vm.isPosterDesign;
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
                $location.path('/info').search('id', movie['_id']).search('type', 'movies');
            }, animate ? 1000 : 0);
        }

        vm.initalize();

        /**
         * Initalize
         */
        function initalize() {
            vm.getDataFromService();
        };

        /**
         * Initial filtering. Filters duration minutes to hour 
         * minutes format and sorts out unwanted genres
         * ---------------------------------------------------
         * @param {obj} all movies object
         */
        function initialFiltering(data) {
            var genres = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].durationMinutes) {
                    data[i].durationMinutes = UtilsService.toHoursMinutes(data[i].durationMinutes);
                }
                if (data[i].genres.length > 0) {
                    for (var g = 0; g < data[i].genres.length; g++) {
                        genres.push(data[i].genres[g].Name);
                    }
                }
            }
            if (genres.length > 0) {
                genres = genres.sort();
                vm.filters.genres = genres.filter(function () {
                    var seen = {};
                    return function (element, index, array) {
                        if (element) {
                            return !(element in seen) && (seen[element] = 1);
                        }
                    };
                } ());
            }

            vm.movies = data;
            vm.allMovies = vm.movies;
            vm.isLoading = false;
            return data;
        };


        /**
         * Resets everything
         */
        function reset() {
            vm.errorMessage = "";
            vm.resetButton = false;
            vm.movies = vm.allMovies;
            vm.orderFilter = [];
            vm.initFilter();
            vm.filters.search = '';
            // Reset all filters
            angular.forEach(document.querySelectorAll('.cs-options ul'), function (ul) {
                angular.forEach(ul.children, function (li) {
                    classie.removeClass(li, 'cs-selected');
                    if (Number(li.getAttribute('data-id')) === 0) {
                        classie.add(li, 'cs-selected');
                        classie.remove(ul.parentNode.previousSibling, 'active');
                        ul.parentNode.previousSibling.innerHTML = li.getAttribute('data-value');
                    }
                });
            });
        }

        $scope.$on('uiChange', function (targetScope, data) {
            switch (data) {
                case 'LIST':
                    vm.isPosterDesign = false;
                    break;
                case 'POSTER':
                    vm.isPosterDesign = true;
                    break;
            }
            sessionStorage.setItem('isPosterDesign', vm.isPosterDesign);
            $scope.$apply();
        });

        $scope.$on('dateChange', function (ev, dayNumber) {
            vm.day = dayNumber;
            vm.getDataFromService();
        });

        // On filtering event filter movies
        $scope.$on('filtering', function (event, filterObj) {
            vm.filter(filterObj);
        });
    };
} ());