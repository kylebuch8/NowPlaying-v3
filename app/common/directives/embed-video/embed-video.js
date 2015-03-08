(function () {
    'use strict';

    /*global angular*/
    angular.module('directives.embedVideo', [
        'services.analytics'
    ])
        .directive('embedVideo', ['analytics', function (analytics) {
            return {
                restrict: 'AE',
                scope: {
                    youtubeId: '=',
                    movieTitle: '='
                },
                template: '<div ng-if="loadingTrailer" class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div><div id="player"></div>',
                controller: ['$scope', '$sce', function ($scope, $sce) {
                    var tag,
                        firstTagScript,
                        player;

                    $scope.loadingTrailer = true;

                    if (!window.YT) {
                        tag = document.createElement('script');
                        tag.src = 'https://www.youtube.com/iframe_api';

                        firstTagScript = document.getElementsByTagName('script')[0];
                        firstTagScript.parentNode.insertBefore(tag, firstTagScript);
                    } else {
                        setupPlayer();
                    }

                    function setupPlayer() {
                        player = new YT.Player('player', {
                            height: '390',
                            width: '640',
                            videoId: $scope.youtubeId,
                            events: {
                                'onReady': onPlayerReady,
                                'onStateChange': onPlayerStateChange
                            }
                        });
                    }

                    function onPlayerReady(event) {
                        $scope.loadingTrailer = false;
                        $scope.$apply();
                    }

                    function onPlayerStateChange(state) {
                        if (state.data === YT.PlayerState.PLAYING) {
                            analytics.trackEvent('Trailer Playing', 'Tap', $scope.movieTitle);
                        }
                    }

                    window.onYouTubeIframeAPIReady = setupPlayer;

                    $scope.url = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + $scope.youtubeId + '?showinfo=0');
                }]
            };
        }]);
}());
