/**
 * The angular tabs module
 */
(function(angular) {

    'use strict';

    angular.module('tabs', []);

    angular.module('tabs')
        .directive('ngTabs', ngTabsDirective);

    function ngTabsDirective() {
        return {
            scope: true,
            restrict: 'EAC',
            controller: ngTabsController
        };
    }

    function ngTabsController($scope) {
        $scope.tabs = {
            index: 0,
            count: 0
        };

        this.headIndex = 0;
        this.bodyIndex = 0;

        this.getTabHeadIndex = function () {
            return $scope.tabs.count = ++this.headIndex;
        };

        this.getTabBodyIndex = function () {
            return ++this.bodyIndex;
        };
    }

    ngTabsController.$inject = ['$scope'];


    angular.module('tabs')
        .directive('ngTabHead', ngTabHeadDirective);

    function ngTabHeadDirective() {
        return {
            scope: false,
            restrict: 'EAC',
            require: '^ngTabs',
            link: function (scope, element, attributes, controller) {
                var index = controller.getTabHeadIndex(),
                    value = attributes.ngTabHead,
                    active = /[-*\/%^=!<>&|]/.test(value) ? scope.$eval(value) : !!value,
                    id = attributes.id;

                scope.tabs.index = scope.tabs.index || ( active ? index : null );

                element.bind('click', function () {
                    scope.tabs.index = index;
                    scope.$$phase || scope.$apply();
                    if(id !== 'showtimes') {
                        scope.$emit('tabData', id);
                    }
                });

                scope.$watch('tabs.index', function () {
                    element.toggleClass('active', scope.tabs.index === index);
                });
            }
        };
    }


    angular.module('tabs')
        .directive('ngTabBody', ngTabBodyDirective);

    function ngTabBodyDirective() {
        return {
            scope: false,
            restrict: 'EAC',
            require: '^ngTabs',
            link: function (scope, element, attributes, controller) {
                var index = controller.getTabBodyIndex();

                scope.$watch('tabs.index', function () {
                    element.toggleClass(attributes.ngTabBody + ' ng-show', scope.tabs.index === index);
                });
            }
        };
    }

})(angular);