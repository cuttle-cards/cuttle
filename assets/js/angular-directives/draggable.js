app.directive('tsDraggable', function () {
	return {
		scope: {
			index: '='
		},
		link: function (scope, element) {
			var el = element[0];
			el.addEventListener('dragstart', function (ev) {
				dragIndex = scope.index;
			});
			el.addEventListener('dragend', function (ev) {
				dragIndex = null;
			});
		}
	}
});