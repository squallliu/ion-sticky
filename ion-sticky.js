angular.module('ion-sticky', ['ionic'])
  .directive('ionSticky', ['$ionicPosition', '$compile', function ($ionicPosition, $compile) {
    return {
      restrict: 'A',
      require: '^$ionicScroll',
      link: function ($scope, $element, $attr, $ionicScroll) {
        var scroll = angular.element($ionicScroll.element);
        var top = $ionicPosition.position($element).top;
        var hasTop = top > 0;
        var clone;
        var cloneVal = function (original, to) {
          var my_textareas = original.getElementsByTagName('textarea');
          var result_textareas = to.getElementsByTagName('textarea');
          var my_selects = original.getElementsByTagName('select');
          var result_selects = to.getElementsByTagName('select');
          for (var i = 0, l = my_textareas.length; i < l; ++i)
            result_textareas[i].value = my_textareas[i].value;
          for (var i = 0, l = my_selects.length; i < l; ++i)
            result_selects[i].value = my_selects[i].value;
        };
        // creates the sticky divider clone and adds it to DOM
        var createStickyClone = function ($element) {
          clone = $element.clone().css({
            position: 'absolute',
            top: $ionicPosition.position(scroll).top + "px", // put to top
            left: 0,
            right: 0
          });
          $attr.ionStickyClass = ($attr.ionStickyClass) ? $attr.ionStickyClass : 'assertive';
          cloneVal($element[0], clone[0]);
          clone[0].className += ' ' + $attr.ionStickyClass;

          clone.removeAttr('ng-repeat-start').removeAttr('ng-if');

          scroll.parent().append(clone);

          // compile the clone so that anything in it is in Angular lifecycle.
          $compile(clone)($scope);
        };

        var removeStickyClone = function () {
          if (clone)
            clone.remove();
          clone = null;
        };

        $scope.$on("$destroy", function () {
          // remove the clone and unbind the scroll listener
          removeStickyClone();
          angular.element($ionicScroll.element).off('scroll');
        });

        var lastActive;
        var minHeight = $attr.minHeight ? $attr.minHeight : 0;
        var updateSticky = ionic.throttle(function () {
          var dividers = [];
          var tmp = $element[0].getElementsByClassName("item-divider");
          for (var i = 0; i < tmp.length; ++i) {
            dividers.push(angular.element(tmp[i]));
          }
          if (dividers.length == 0) {
            return;
          }
          var active = null;
          for (var i = 0; i < dividers.length; ++i) {
            var offsetTop = $ionicPosition.offset(dividers[i]).top;
            var offsetHeight = dividers[i].prop('offsetHeight');
            var offset = hasTop ? offsetTop - minHeight - top : offsetTop - offsetHeight - minHeight;
            if (offset < 0) {
              if (i === dividers.length - 1) {
                active = dividers[i][0];
                break;
              }
              var nextOffsetTop = $ionicPosition.offset(dividers[i + 1]).top;
              var activeOffset = hasTop ? nextOffsetTop - minHeight - top : nextOffsetTop - (offsetHeight + dividers[i + 1].prop('offsetHeight')) - minHeight;
              if (activeOffset > 0) {
                active = dividers[i][0];
                break;
              }
            }
          }

          if (lastActive != active) {
            removeStickyClone();
            lastActive = active;
            if (active != null)
              createStickyClone(angular.element(active));
          }
          //console.log(performance.now());
        }, 200);
        scroll.on('scroll', function (event) {
          updateSticky();
        });
      }
    }
  }]);
