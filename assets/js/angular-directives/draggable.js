app.directive('tsDraggable', function () {
	return {
		scope: {
			index: '='
		},
		link: function (scope, element) {
			var el = element[0];
			el.addEventListener('dragstart', function (ev) {
				// ev.dataTransfer.setData('text', scope.index);
				// console.log("\nDragging: " + ev.dataTransfer.getData('text'));
				dragIndex = scope.index;
			});
			el.addEventListener('dragend', function (ev) {
				dragIndex = null;
			});
		}
	}
});