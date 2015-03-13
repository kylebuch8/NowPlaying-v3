(function () {
    'use strict';

    /*global angular*/
    function UiAnimatedPages() {
        var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;

        function preventScroll(event) {
            if (iOS) {
                event.preventDefault();
            }
        }

        this.enableScroll = function () {
            if (iOS) {
                document.body.removeEventListener('touchmove', preventScroll);
            }
        }

        this.disableScroll = function () {
            if (iOS) {
                document.body.addEventListener('touchmove', preventScroll);
            }
        }
    }

    var transformJs = Modernizr.prefixed('transform'),
        transformCss = transformJs.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    angular.module('directives.uiAnimatedPages', [])
        .directive('uiAnimatedPages', ['$timeout', function ($timeout) {
            return {
                restrict: 'AE',
                scope: {
                    pageIndicators: '=',
                    pagesData: '=',
                    selected: '=',
                    goToSelected: '='
                },
                transclude: true,
                link: function (scope, element, attrs, ctrl, $transcludeFn) {
                    var numPages = scope.pagesData.length,
                        current = 0,
                        next = 1,
                        previous = numPages - 1,
                        start,
                        end,
                        width = element[0].clientWidth,
                        threshold = 100,
                        pageChanged = false,
                        completedTransitionEvents = 0,
                        forward = false;

                    element.append($transcludeFn(scope));

                    /*
                     * we need this for the ng-repeat to finish
                     */
                    $timeout(function () {
                        element[0].children[previous].style.cssText += 'z-index: 1; ' + transformCss + ': translate3d(-100%, 0, 0); scale(1); opacity: 1;';
                        element[0].children[current].style.cssText += 'z-index: 0; ' + transformCss + ': translate3d(0, 0, 0) scale(1); opacity: 1;';
                        element[0].children[next].style.cssText += 'z-index: -1; ' + transformCss + ': translate3d(0, 0, 0) scale(0.75); opacity: 0;'

                        var i = 0;
                        while (i < numPages) {
                            if (i !== previous && i !== current && i !== next) {
                                element[0].children[i].style.cssText += 'z-index: 1; ' + transformCss + ': translate3d(-100%, 0px, 0px) scale(1); opacity: 1;';
                            }

                            i += 1;
                        }
                    });

                    element.bind('transitionend', function (event) {
                        event.target.classList.remove('animate');

                        completedTransitionEvents += 1;

                        if (pageChanged && completedTransitionEvents === 3) {
                            pageChanged = false;
                            completedTransitionEvents = 0;

                            if (forward) {
                                current += 1;
                                if (current === numPages) {
                                    current = 0;
                                }

                                next += 1;
                                if (next === numPages) {
                                    next = 0;
                                }

                                previous = current - 1;
                                if (previous === -1) {
                                    previous = numPages - 1;
                                }

                                element[0].children[previous].style.zIndex = 1;

                                element[0].children[next].style.zIndex = -1;
                                element[0].children[next].style.opacity = 0;
                                element[0].children[next].style[transformJs] = 'translate3d(0, 0, 0) scale(0.75)';
                            } else {
                                element[0].children[current].style.zIndex = -1;

                                element[0].children[next].style.zIndex = 1;
                                element[0].children[next].style.opacity = 1;
                                element[0].children[next].style[transformJs] = 'translate3d(-100%, 0, 0) scale(1)';

                                current -= 1;
                                if (current === -1) {
                                    current = numPages - 1;
                                }

                                next -= 1;
                                if (next === -1) {
                                    next = numPages - 1;
                                }

                                previous = current - 1;
                                if (previous === -1) {
                                    previous = numPages - 1;
                                }
                            }

                            element[0].children[current].style.zIndex = 0;
                        }
                    });

                    element.bind('touchstart', function (event) {
                        event.preventDefault();
                        start = event.changedTouches[0].pageX;
                    });

                    element.bind('touchmove', function (event) {
                        var difference = (event.changedTouches[0].pageX - start).toFixed(0),
                            scale = Math.abs(difference / width) / 4;

                        if (difference < 0) {
                            element[0].children[current].style[transformJs] = 'translate3d(' + difference + 'px, 0, 0) scale(1)';

                            element[0].children[next].style[transformJs] = 'translate3d(0, 0, 0) scale(' + (0.75 + scale) + ')';
                            element[0].children[next].style.opacity = Math.abs(difference / width).toFixed(2);

                            return;
                        }

                        if (difference > 0) {
                            element[0].children[current].style[transformJs] = 'translate3d(0, 0, 0) scale(' + (1 - scale) + ')';
                            element[0].children[current].style.opacity = 1 - Math.abs(difference / width).toFixed(2);

                            element[0].children[previous].style[transformJs] = 'translate3d(' + (-(width - difference)) + 'px, 0, 0) scale(1)';
                        }
                    });

                    element.bind('touchend', function (event) {
                        end = event.changedTouches[0].pageX;

                        var difference = start - end;

                        completedTransitionEvents = 0;

                        element[0].children[current].classList.add('animate');

                        if (difference > 0) {
                            element[0].children[next].classList.add('animate');

                            if (Math.abs(difference) >= threshold) {
                                element[0].children[current].style[transformJs] = 'translate3d(-100%, 0, 0) scale(1)';

                                element[0].children[next].style[transformJs] = 'translate3d(0, 0, 0) scale(1)';
                                element[0].children[next].style.opacity = 1;

                                pageChanged = true;
                                forward = true;
                            } else {
                                element[0].children[current].style[transformJs] = 'translate3d(0, 0, 0) scale(1)';

                                element[0].children[next].style[transformJs] = 'translate3d(0, 0, 0) scale(0.75)';
                                element[0].children[next].style.opacity = 0;
                            }

                            return;
                        }

                        if (difference < 0) {
                            element[0].children[previous].classList.add('animate');

                            if (Math.abs(difference) >= threshold) {
                                element[0].children[current].style[transformJs] = 'translate3d(0, 0, 0) scale(0.75)';
                                element[0].children[current].style.opacity = 0;

                                element[0].children[previous].style[transformJs] = 'translate3d(0, 0, 0) scale(1)';

                                pageChanged = true;
                                forward = false;
                            } else {
                                element[0].children[current].style[transformJs] = 'translate3d(0, 0, 0) scale(1)';
                                element[0].children[current].style.opacity = 1;

                                element[0].children[previous].style[transformJs] = 'translate3d(-100%, 0, 0) scale(1)';
                            }
                        }
                    });
                }
            };
        }])

        .service('$uiAnimatedPages', [function () {
            return {
                getInstance: function () {
                    return new UiAnimatedPages();
                }
            };
        }]);
}());
