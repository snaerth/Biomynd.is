/* 
==========================================================================
Navigation controller
========================================================================== 
*/
(function () {
    'use strict';
    angular
        .module('navigation')
        .controller('NavigationController', NavigationController);

    NavigationController.$inject = ['$scope', '$location', '$rootScope'];

    function NavigationController($scope, $location, $rootScope) {
        var nav = this;
        var monthNames = ["janúar", "febrúar", "mars", "apríl", "maí", "júní", "júlý", "ágúst", "september", "október", "nóvember", "desember"],
            days = ["Sun", "Mán", "Þri", "Mið", "Fim", "Fös", "Lau"];

        var DateHelper = {
            addDays: function (aDate, numberOfDays) {
                aDate.setDate(aDate.getDate() + numberOfDays);
                return aDate;
            },
            format: function (date) {
                return [
                    (date.getDate() + '').slice(-2),
                    (monthNames[(date.getMonth())])
                ].join('. ');
            }
        }

        var GetDayOfWeek = function (DaysIntoFuture) {
            var date = new Date(),
                day = date.getDay() + DaysIntoFuture;
            if ((day % 6) > 0) {
                day = day % 7;
            }
            return days[day];
        }

        nav.PageTitle = "Sýningar í dag";
        nav.show = true;
        nav.pages = [];

        nav.pages.push({
            name: 'Í dag',
            href: '/',
            day: 0,
            active: true,
            text: "Sýningar í dag"
        });

        nav.pages.push({
            name: GetDayOfWeek(1),
            href: '/?day=1',
            day: 1,
            active: false,
            text: "Sýningar " + DateHelper.format(DateHelper.addDays(new Date(), 1))
        });

        nav.pages.push({
            name: GetDayOfWeek(2),
            href: '/?day=2',
            day: 2,
            active: false,
            text: "Sýningar " + DateHelper.format(DateHelper.addDays(new Date(), 2))
        });

        nav.pages.push({
            name: GetDayOfWeek(3),
            href: '/?day=3',
            day: 3,
            active: false,
            text: "Sýningar " + DateHelper.format(DateHelper.addDays(new Date(), 3))
        });

        nav.pages.push({
            name: GetDayOfWeek(4),
            href: '/?day=4',
            day: 4,
            active: false,
            text: "Sýningar " + DateHelper.format(DateHelper.addDays(new Date(), 4))
        });

        nav.pages.push({
            name: 'Væntanlegt',
            href: '/vaentanlegt',
            active: false,
            text: "Væntanlegt"
        });

        init();

        // Run for window load
        function init() {
            if(window.location.href.indexOf('/info') > -1) {
                nav.show = false;
                classie.add(document.querySelector('div[filter-opener]'), 'hidden');
            }
        };

        $scope.$on("$locationChangeStart", function (event, nextLocation, currentLocation) {
            classie.remove(document.querySelector('div[filter-opener]'), 'hidden');
            nav.show = true;
            var fragment = nextLocation.substring(nextLocation.indexOf($location.url()));   
            for (var i = 0; i < nav.pages.length; i++)
            {
                if(i === 0) {
                    if(fragment === '/' || $location.url() === '/') {
                        nav.pages[0].active = true;
                        nav.PageTitle =  nav.pages[0].text;
                    } else  {
                        nav.pages[0].active = false;
                    }
                  } else {

                    if(fragment.indexOf(nav.pages[i].href) > -1) {
                        nav.pages[i].active = true;
                        nav.PageTitle =  nav.pages[i].text;
                    } else  {
                        nav.pages[i].active = false;
                    }
                }

                // Hide header if url contains info
                if(nextLocation.indexOf('/info') > -1) {
                    classie.add(document.querySelector('div[filter-opener]'), 'hidden');
                    nav.show = false;
                }

                // Notify home controller to get movies for current day
                if (nav.pages[i].active && (nav.pages[i].day || nav.pages[i].day === 0)) {
                    $rootScope.$broadcast('dateChange', nav.pages[i].day);
                }
            }
        });
    };
} ());



