(function () {
    'use strict';

    angular
        .module('filter')
        .service('FilterService', FilterService);

    FilterService.$inject = ['UtilsService'];

    function FilterService(UtilsService) {
        return {
            filterByGenres: filterByGenres,
            filterByMonths: filterByMonths,
            filterBySearch: filterBySearch,
            filterByTheaters: filterByTheaters,
            filterByCertificate: filterByCertificate,
            filterByShowtimes: filterByShowtimes,
            mixedFilter: mixedFilter,
            filterToggle: filterToggle
        };

        /**
        * Filters movies by genres
        * --------------------------------------
        * @param {query} query to filter by
        * @param {movies} movies  to filter
        */
        function filterByGenres(query, movies, allMovies) {
            if (query.id == '') return allMovies;
            var tempMovies = [];
            for (var m = 0; m < movies.length; m++) {
                if (movies[m].genres.length && movies[m].genres.length > 0) {
                    for (var g = 0; g < movies[m].genres.length; g++) {
                        if (movies[m].genres && movies[m].genres[g].Name == query.id) {
                            tempMovies.push(movies[m]);
                        }
                    }
                }
            }
            return tempMovies;
        };

        /**
        * Filters movies by months
        * --------------------------------------
        * @param {query} query to filter by
        * @param {movies} movies  to filter
        */
        function filterByMonths(query, movies, allMovies) {
            if (query.id == 0) return allMovies;
            var tempMovies = [];
            for (var m = 0; m < movies.length; m++) {
                if (movies[m].monthId && movies[m].monthId == query.id) {
                    tempMovies.push(movies[m]);
                }
            }
            return tempMovies;
        };

        /**
        * Filters movies by search
        * --------------------------------------
        * @param {query} query to filter by
        * @param {movies} movies  to filter
        */
        function filterBySearch(query, movies, allMovies) {
            if (query.id === '') return allMovies;
            var tempMovies = [];
            for (var m = 0; m < movies.length; m++) {
                if (movies[m].title.toLowerCase().indexOf(query.id.toLowerCase()) > -1) {
                    tempMovies.push(movies[m]);
                }
            }
            return tempMovies;
        };

        /**
        * Filters movies by theaters
        * --------------------------------------
        * @param {query} query to filter by
        * @param {movies} movies  to filter
        */
        function filterByTheaters(query, movies, allMovies) {
            if (query.id == 0) return allMovies;
            var tempMovies = [];
            for (var m = 0; m < movies.length; m++) {
                for (var s = 0; s < movies[m].showtimes.length; s++) {
                    if (movies[m].showtimes[s].cinema && movies[m].showtimes[s].cinema.id == query.id) {
                        tempMovies.push(movies[m]);
                    }
                }
            }
            return tempMovies;
        };

        /**
        * Filters movies by certificate
        * --------------------------------------
        * @param {query} query to filter by
        * @param {movies} movies  to filter
        */
        function filterByCertificate(query, movies, allMovies) {
            if (query.id == 0) return allMovies;
            var tempMovies = [];
            for (var m = 0; m < movies.length; m++) {
                if (movies[m].certificate && movies[m].certificate.number == query.id) {
                    tempMovies.push(movies[m]);
                }
            }
            return tempMovies;
        };

        /**
        * Filters movies by showtimes bigger or equal to query
        * --------------------------------------
        * @param {query} query to filter by
        * @param {movies} movies  to filter
        */
        function filterByShowtimes(query, movies, allMovies) {
            if (query.id == 0) return allMovies;
            var tempMovies = [];
            for (var m = 0; m < movies.length; m++) {
                var match = false;
                for (var s = 0; s < movies[m].showtimes.length; s++) {
                    for (var t = 0; t < movies[m].showtimes[s].schedule.length; t++) {
                        var time = movies[m].showtimes[s].schedule[t].time,
                            timeStr = time.match(/([2][0-3]|[01]?[0-9])([.:][0-5][0-9])/);
                        timeStr = timeStr[0].replace('.', ':');
                        if (time && timeStr >= query.id) {
                            match = true;
                        }
                    }
                }
                if (match) tempMovies.push(movies[m]);
            }
            return tempMovies;
        };

        /**
         * Filters movies by order
         * if id = 1 movie title ascending
         * if id = 2 movie title decending
         * if id = 3 movie imdb score ascending
         * if id = 4 movie imdb score decending
         * --------------------------------------
         * @param {query} query object to filter movies
         */
        function mixedFilter(query, movies, allMovies) {
            var tempMovies = Object.create(movies);
            query.id = parseInt(query.id);
            if (query.id === 3 || query.id === 4) {
                var ascending = (query.id === 3) ? false : true;
                tempMovies = tempMovies.sort(UtilsService.SortBy('title', null, ascending, function (movie) { 
                    return movie; 
                }));
            } else if (query.id === 1 || query.id === 2) {
                var ascending = (query.id === 1) ? true : false;
                tempMovies = tempMovies.sort(UtilsService.SortBy('ratings', 'imdb', ascending, function (movie) { 
                    return movie;
                }));
            }
            return tempMovies;
        }

        /**
         * Toggles filter and view
         */
        function filterToggle() {
            if (window.innerWidth < 600 || document.body.clientWidth < 600) {
                // Scroll view on top
                var body = document.querySelector('body');
                body.scrollTop = 0;
                var filter = document.querySelector('.filter_container--outer');
                var exitIcon = document.querySelector('div[filter-opener] .icon-exit');
                var filterIcon = document.querySelector('div[filter-opener] .icon-filter');
                if (classie.has(filter, 'open')) {
                    classie.remove(filter, 'open');
                    classie.add(exitIcon, 'hidden');
                    classie.remove(filterIcon, 'hidden');
                } else {
                    classie.add(filter, 'open');
                    classie.remove(exitIcon, 'hidden');
                    classie.add(filterIcon, 'hidden');
                }
            }
        };
    };
} ());