(function () {
    'use strict';

    /*global angular*/
    angular.module('directives.uiAnimatedPages', [])
        .directive('uiAnimatedPages', ['$timeout', function ($timeout) {

            function init(scope, element) {
                var pages = element.children(),
                    current = 0,
                    start,
                    difference,
                    width = element[0].clientWidth,
                    threshold = 100;

                function getNext() {
                    var next = current + 1;

                    if (next === pages.length) {
                        next = 0;
                    }

                    return next;
                }

                function getPrevious() {
                    var previous = current - 1;

                    if (previous === -1) {
                        previous = pages.length - 1;
                    }

                    return previous;
                }

                function preventScroll(event) {
                    event.preventDefault();
                }

                function windowResize() {
                    width = element[0].clientWidth;
                }

                /*
                 * we want to prevent any scrolling on the body
                 */
                document.body.addEventListener('touchmove', preventScroll);

                /*
                 * listen for when the page resizes so we can
                 * get the width of the element
                 */
                window.addEventListener('resize', windowResize);

                scope.$on('$destroy', function () {
                    document.body.removeEventListener('touchmove', preventScroll);
                    window.removeEventListener('resize', windowResize);
                });

                element[0].addEventListener('transitionend', function (event) {
                    event.target.classList.remove('animate', 'show-back', 'hide-back', 'hide');
                    event.target.style.zIndex = null;
                });

                element[0].addEventListener('touchstart', function (event) {
                    start = event.changedTouches[0].pageX;
                });

                element[0].addEventListener('touchmove', function (event) {
                    var scale;

                    difference = event.changedTouches[0].pageX - start;
                    scale = Math.abs(difference / width) / 4;

                    /*
                     * if difference is negative, we are moving left.
                     * if we are moving right, we need to scale the current
                     * page down
                     */
                    if (difference < 0) {
                        pages[current].style.WebkitTransform = 'translate3d(' + difference +  'px, 0, 0)';
                        pages[current].style.transform = 'translate3d(' + difference +  'px, 0, 0)';

                        pages[getNext()].style.WebkitTransform = 'scale(' + (0.75 + scale) + ')';
                        pages[getNext()].style.transform = 'scale(' + (0.75 + scale) + ')';
                        pages[getNext()].style.opacity = Math.abs(difference / width).toFixed(2);
                    } else {
                        /*
                         * we're moving to the right
                         */
                        pages[current].style.WebkitTransform = 'scale(' + (1 - scale) + ')';
                        pages[current].style.transform = 'scale(' + (1 - scale) + ')';
                        pages[current].style.opacity = 1 - Math.abs(difference / width).toFixed(2);

                        pages[getPrevious()].style.zIndex = 2;
                        pages[getPrevious()].style.opacity = 1;
                        pages[getPrevious()].style.WebkitTransform = 'translate3d(' + (-(width - difference)) + 'px, 0, 0)';
                        pages[getPrevious()].style.transform = 'translate3d(' + (-(width - difference)) + 'px, 0, 0)';
                    }
                });

                element[0].addEventListener('touchend', function () {
                    if (difference) {
                        pages[current].style.WebkitTransform = null;
                        pages[current].style.transform = null;
                        pages[current].style.opacity = null;

                        pages[getNext()].style.WebkitTransform = null;
                        pages[getNext()].style.transform = null;
                        pages[getNext()].style.opacity = null;

                        pages[getPrevious()].style.WebkitTransform = null;
                        pages[getPrevious()].style.transform = null;
                        pages[getPrevious()].style.opacity = null;

                        if (difference < 0) {
                            /*
                             * we're moving left
                             */
                            if (Math.abs(difference) >= threshold) {
                                angular.element(pages[current]).removeClass('show').addClass('hide');
                                angular.element(pages[getNext()]).addClass('show animate');

                                current += 1;

                                if (current === pages.length) {
                                    current = 0;
                                }

                                scope.pageIndicators.activate(current);
                                scope.$apply();

                            } else {
                                angular.element(pages[current]).addClass('animate');
                                angular.element(pages[getNext()]).addClass('animate');
                            }
                        } else {
                            /*
                             * we're moving right
                             */
                             if (Math.abs(difference) >= threshold) {
                                 angular.element(pages[current]).removeClass('show').addClass('animate hide-back');
                                 angular.element(pages[getPrevious()]).addClass('animate show-back show');

                                 current -= 1;

                                 if (current === -1) {
                                     current = pages.length - 1;
                                 }

                                 scope.pageIndicators.activate(current);
                                 scope.$apply();
                             } else {
                                 angular.element(pages[current]).addClass('animate');
                                 angular.element(pages[getPrevious()]).addClass('animate hide');
                             }
                        }

                        difference = 0;
                    }
                });
            }

            return {
                restrict: 'AE',
                scope: {
                    pageIndicators: '='
                },
                link: function (scope, element) {
                    $timeout(function () {
                        init(scope, element);
                    }, 0);

                }
            };
        }]);
}());
