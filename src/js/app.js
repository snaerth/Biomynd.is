/* 
==========================================================================
Angular initialize and configs
========================================================================== 
*/
(function () {
    angular.module('app', [
        'ngRoute',
        'ngTouch',
        'navigation',
        'directives',
        'httpRequest',
        'movieService',
        'utils',
        'filter',
        'tabs',
        'PreloadedData',
        'home',
        'upcoming',
        'movieDetails'
    ]);

    // Route configureation
    angular.module('app')
        .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
            $routeProvider
                .when('/', { 
                    templateUrl: 'js/home/home.html', 
                    controller: 'HomeController', 
                    controllerAs: 'vm'
                })
                .when('/info/', { 
                    templateUrl: 'js/moviedetails/moviedetails.html',
                    controller: 'MovieDetailsController', 
                    controllerAs: 'mi'
                })
                .when('/vaentanlegt/', { 
                    templateUrl: 'js/upcoming/upcoming.html', 
                    controller: 'UpcomingController', 
                    controllerAs: 'uc'
                 })
                .otherwise({ 
                    redirectTo: '/' 
                });

                //$locationProvider.html5Mode(true).hashPrefix('!');
        }])

        .filter('trusted', ['$sce', function ($sce) {
            return function (url) {
                return $sce.trustAsResourceUrl(url);
            };
        }])
        
        .run(['$rootScope', '$route', '$location', '$routeParams', function ($rootScope, $route, $location, $routeParams) {}]);
} ());
