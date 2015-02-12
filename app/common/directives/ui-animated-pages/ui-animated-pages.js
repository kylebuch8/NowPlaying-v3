(function () {
    'use strict';

    /*global angular*/
    angular.module('directives.uiAnimatedPages', [])
        .directive('uiAnimatedPages', [function () {
            return {
                restrict: 'AE',
                link: function (scope, element) {
                    var previousBtn = document.getElementById('previous'),
                        nextBtn = document.getElementById('next'),
                        pages = element.children(),
                        current = 0,
                        start,
                        difference,
                        width = element[0].clientWidth,
                        threshold = 0.25;

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
                    document.body.addEventListener('touchstart', preventScroll);

                    /*
                     * listen for when the page resizes so we can
                     * get the width of the element
                     */
                    window.addEventListener('resize', windowResize);

                    scope.$on('$destroy', function () {
                        document.body.removeEventListener('touchstart', preventScroll);
                        window.removeEventListener('resize', windowResize);
                    });

                    element[0].addEventListener('transitionend', function (event) {
                        angular.element(event.target).removeClass('animate show-back hide-back hide');
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
                            pages[getNext()].style.opacity = scale * 1.5;
                        } else {
                            /*
                             * we're moving to the right
                             */
                            pages[current].style.WebkitTransform = 'scale(' + (1 - scale) + ')';
                            pages[current].style.transform = 'scale(' + (1 - scale) + ')';
                            pages[current].style.opacity = 1 - Math.abs(difference / width);

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
                                if (Math.abs(difference / width) >= threshold) {
                                    angular.element(pages[current]).removeClass('show').addClass('hide');
                                    angular.element(pages[getNext()]).addClass('show animate');

                                    current += 1;

                                    if (current === pages.length) {
                                        current = 0;
                                    }

                                } else {
                                    angular.element(pages[current]).addClass('animate');
                                    angular.element(pages[getNext()]).addClass('animate');
                                }
                            } else {
                                /*
                                 * we're moving right
                                 */
                                 if (Math.abs(difference / width) >= threshold) {
                                     angular.element(pages[current]).removeClass('show').addClass('animate hide-back');
                                     angular.element(pages[getPrevious()]).addClass('animate show-back show');

                                     current -= 1;

                                     if (current === -1) {
                                         current = pages.length - 1;
                                     }
                                 } else {
                                     angular.element(pages[current]).addClass('animate');
                                     angular.element(pages[getPrevious()]).addClass('animate hide');
                                 }
                            }

                            difference = 0;
                        }
                    });

                    function nextBtnClickHandler() {
                        angular.element(pages[current]).removeClass('show').addClass('hide');

                        current += 1;

                        if (current === pages.length) {
                            current = 0;
                        }

                        angular.element(pages[current]).addClass('show');
                    }

                    function previousBtnClickHandler() {
                        angular.element(pages[current]).removeClass('show').addClass('hide-back');
                        angular.element(pages[getPrevious()]).addClass('left');

                        current -= 1;

                        if (current === -1) {
                            current = pages.length - 1;
                        }

                        angular.element(pages[current]).addClass('show');
                    }

                    previousBtn.addEventListener('click', previousBtnClickHandler);
                    nextBtn.addEventListener('click', nextBtnClickHandler);
                }
            };
        }]);
}());
