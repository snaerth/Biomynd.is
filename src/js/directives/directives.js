/* 
==========================================================================
Directives
========================================================================== 
*/
(function () {
    angular.module('directives')
        .directive('imageOnload', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.on('load', function (event, err) {
                        if (element.parent().parent()[0].nextElementSibling) {
                            element.parent().parent()[0].nextElementSibling.className += ' hidden';
                        }
                    });

                    element.bind('error', function (err) {
                        if (attrs.backupImage !== '') {
                            attrs.$set('src', attrs.backupImage);
                        }
                    });
                }
            };
        })

        .directive('imageOnloadBackdrop', function () {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    element.on('load', function () {
                        var children = element.parent()[0].children;
                        for (var i = 0; i < children.length; i++) {
                            if (children[i].className == "image_loader") {
                                children[i].className += ' hidden';
                                break;
                            }
                        }
                    });
                }
            };
        })

        .directive('backButton', ['$window', '$location', function ($window, $location) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.bind('click', function () {
                        if(sessionStorage.getItem('fromIndex')) {
                            $window.history.back();
                        } else {
                            $window.location.href = '/';
                        }
                        scope.$apply();
                    });
                }
            }
        }])

        .directive('imageOnloadList', function () {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    element.on('load', function () {
                        var children = element.parent()[0].children;
                        for (var i = 0; i < children.length; i++) {
                            if (children[i].className == "image_loader") {
                                children[i].className += ' hidden';
                                break;
                            }
                        }
                    });
                }
            };
        })

        .directive('loading', function () {
            return {
                templateUrl: '../views/templates/loading.html'
            }
        })

        .directive('backImg', [function () {
            return {
                restrict: 'A',
                scope: {
                    images: '='
                },
                link: function (scope, element, attrs) {
                    function backgroundSequence(urls) {
                        if (urls) {
                            var k = 0,
                                secs = 7;

                            var img = new Image();

                            // For IE preload fix
                            var cacheImage = $(img).attr("src", new Date().getTime());
                            img.src = urls[0];

                            img.onload = function () {
                                for (i = 0; i < urls.length; i++) {
                                    setTimeout(function () {
                                        element.css({ 'background-image': 'url(' + urls[k] + ')' });
                                        if ((k + 1) === urls.length) {
                                            setTimeout(function () {
                                                backgroundSequence();
                                            }, (secs * 1000))
                                        }
                                        else {
                                            k++;
                                        }
                                    }, (secs * 1000) * i)
                                }
                            }
                        }
                    }


                    scope.$watch('images', function (newValue, oldValue) {
                        if (newValue) {
                            var urls = newValue;
                            // Cache all the images
                            urls.forEach(function (url) {
                                new Image().src = url;
                            });
                            backgroundSequence(urls);
                        }
                    });
                }
            }
        }])

        .directive('selectFilterRepeat', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    if (scope.$last) {
                        scope.$emit(attrs.type);
                    }
                }
            }
        })

        .directive('selectBox', function () {
            return {
                restrict: 'A',
                replace: true,
                link: function (scope, element, attrs) {
                    scope.$on(attrs.type, function (event) {
                        setTimeout(function () {
                            new SelectFx(document.querySelector('select.cs-select.' + attrs.id), {
                                onChange: function (val) {
                                    scope.$broadcast('filtering', val);
                                    scope.$apply();
                                }
                            });
                        }, 0);
                    });

                    // On error
                    scope.$on('error', function (event, error) {
                        scope.errorMessage = error;
                    });
                }
            }
        })

        .directive('movieFilters', function () {
            return {
                templateUrl: '../views/templates/moviefilters.html',
            }
        })

        .directive('toggleSearch', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.bind('click', function(e) {
                        var search = $('#sb-search');
                        search.toggleClass('sb-search-open');
                        search.find('input').focus();
                        $(document).click(function (e) {
                            if (!search.is(e.target) && search.has(e.target).length === 0) {
                                search.focusout();
                                search.removeClass('sb-search-open');
                                $(document).unbind('click');
                            }
                        });
                    });
                }
            }
        })

        .directive('upcomingFilters', function () {
            return {
                templateUrl: '../views/templates/upcomingFilters.html'
            }
        })

        .directive('dropdown', ['UtilsService', function (UtilsService) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var eventType = UtilsService.eventType();

                    element.bind(eventType, function (ev) {
                        var bodyClickHandler,
                            content = document.querySelector('.content'),
                            child = element.children()[0],
                            myEvtHandler = function (el) {
                                return function (ev) {
                                    ev.stopPropagation();
                                    classie.remove(child, 'active');
                                    DetachEvent(content, eventType, bodyClickHandler);
                                };
                            };
                        if (!classie.hasClass(child, 'active')) {
                            ev.stopPropagation();
                            classie.addClass(child, 'active');
                            bodyClickHandler = myEvtHandler(content);
                            AttachEvent(content, eventType, bodyClickHandler);
                        } else {
                            classie.removeClass(child, 'active');
                        }
                    });

                    scope.navigate = function (id, ev) {
                        var parent = ev.target.parentElement;
                        Array.prototype.forEach.call(parent.children, function (el) {
                            classie.remove(el, 'active');
                        });
                        classie.addClass(ev.target, 'active');
                        scope.$broadcast('uiChange', id);
                    }
                }
            }
        }])

        .directive('menuButton', ['UtilsService', function (UtilsService) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var eventType = UtilsService.eventType();
                    element.bind(eventType, function (ev) {
                        element.toggleClass(attrs.toggleClass);
                        var content = document.querySelector('.content'),
                            filter = document.querySelector('.filter_container'),
                            bodyClickHandler,
                            myEvtHandler = function (el) {
                                return function (ev) {
                                    ev.stopPropagation();
                                    classie.remove(el, 'content--open');
                                    classie.remove(filter, 'filter_container--open');
                                    element.removeClass(attrs.toggleClass);
                                    UtilsService.DetachEvent(content, eventType, bodyClickHandler);
                                };
                            };
                        if (element.hasClass('menu-button--open')) {
                            classie.add(content, 'content--open');
                            classie.add(filter, 'filter_container--open');
                            element.addClass(attrs.toggleClass);
                            ev.stopPropagation();
                            bodyClickHandler = myEvtHandler(content);
                            UtilsService.AttachEvent(content, eventType, bodyClickHandler);
                        } else {
                            classie.remove(content, 'content--open');
                            classie.remove(filter, 'filter_container--open');
                        }
                    });
                }
            };
        }])

        .directive('toggleView', [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.bind('click', clickHandler);

                    function clickHandler(ev) {
                        var type = attrs.toggleView;
                        if(type === 'POSTER') {
                            $(element).find('.icon-grid').removeClass('icon-grid');
                            type = 'POSTER';
                        } else {
                            $(element).find('.icon').addClass('icon-grid');
                            type = 'LIST';
                        }
                        scope.$broadcast('uiChange', type.toUpperCase());
                    }
                }
            };
        }])

        .directive('filterOpener', ['UtilsService', function (UtilsService) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var eventType = UtilsService.eventType();
                    element.bind(eventType, function (ev) {
                        var children = element[0].children;
                        for (var i = 0; i < children.length; i++) {

                            if (classie.has(children[i], 'hidden')) {
                                classie.remove(children[i], 'hidden')
                            } else {
                                classie.add(children[i], 'hidden')
                            }
                        }
                        classie.toggle(document.querySelector('.filter_container--outer'), 'open');
                        classie.toggle(document.querySelector('.menu-button'), 'hidden');
                    });
                }
            };
        }]);
} ());