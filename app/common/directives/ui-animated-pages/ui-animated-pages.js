(function () {
    'use strict';

    /*global angular*/
    var numPages = 3,
        current,
        currentPage,
        pagesData;

    function UiAnimatedPages() {
        function preventScroll(event) {
            event.preventDefault();
        }

        this.enableScroll = function () {
            document.body.removeEventListener('touchmove', preventScroll);
        }

        this.disableScroll = function () {
            document.body.addEventListener('touchmove', preventScroll);
        }
    }

    function getNext() {
        var next = current + 1;

        if (next === numPages) {
            next = 0;
        }

        return next;
    }

    function getNextPage() {
        var next = currentPage + 1;

        if (next === pagesData.length) {
            next = 0;
        }

        return next;
    }

    function getPrevious() {
        var previous = current - 1;

        if (previous === -1) {
            previous = numPages - 1;
        }

        return previous;
    }

    function getPreviousPage() {
        var previous = currentPage - 1;

        if (previous === -1) {
            previous = pagesData.length - 1;
        }

        return previous;
    }

    angular.module('directives.uiAnimatedPages', [])
        .directive('uiAnimatedPages', ['$timeout', function ($timeout) {

            function init(scope, element) {
                var pages = element.children(),
                    start,
                    difference,
                    width = element[0].clientWidth,
                    threshold = 100,
                    direction;

                pages[0].classList.add('show');

                function preventScroll(event) {
                    event.preventDefault();
                }

                function windowResize() {
                    width = element[0].clientWidth;
                }

                /*
                 * we want to prevent any scrolling on the body
                 */
                //document.body.addEventListener('touchmove', preventScroll);

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

                    scope.$apply(function () {
                        if (direction === 'left') {
                            scope.data[getNext()] = scope.pagesData[getNextPage()];
                        } else {
                            scope.data[getPrevious()] = scope.pagesData[getPreviousPage()];
                        }
                        pages = element.children();
                    });
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
                        direction = 'left';
                        pages[current].style.WebkitTransform = 'translate3d(' + difference +  'px, 0, 0)';
                        pages[current].style.transform = 'translate3d(' + difference +  'px, 0, 0)';

                        pages[getNext()].style.WebkitTransform = 'scale(' + (0.75 + scale) + ')';
                        pages[getNext()].style.transform = 'scale(' + (0.75 + scale) + ')';
                        pages[getNext()].style.opacity = Math.abs(difference / width).toFixed(2);
                    } else {
                        /*
                         * we're moving to the right
                         */
                        direction = 'right';
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
                                currentPage += 1;

                                if (current === pages.length) {
                                    current = 0;
                                }

                                if (currentPage === scope.pagesData.length) {
                                    currentPage = 0;
                                }

                                scope.pageIndicators.activate(currentPage);
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
                                 currentPage -= 1;

                                 if (current === -1) {
                                     current = pages.length - 1;
                                 }

                                 if (currentPage === -1) {
                                     currentPage = scope.pagesData.length - 1;
                                 }

                                 scope.pageIndicators.activate(currentPage);
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
                    pageIndicators: '=',
                    pagesData: '=',
                    selected: '=',
                    goToMovie: '='
                },
                templateUrl: 'components/np-movies/np-movie.html',
                link: function (scope, element) {
                    current = 0;
                    currentPage = scope.selected;
                    pagesData = scope.pagesData;

                    scope.data = [scope.pagesData[currentPage], scope.pagesData[getNextPage()], scope.pagesData[getPreviousPage()]];

                    $timeout(function () {
                        init(scope, element);
                    }, 0);
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
