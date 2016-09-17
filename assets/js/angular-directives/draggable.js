app.directive('tsDraggable', function () {
	return {
		scope: {
			index: '='
		},
		link: function (scope, element) {
			var el = element[0];
			el.addEventListener('dragstart', function (ev) {
				console.log("In dragstart");
				dragIndex = scope.index;
			});
			el.addEventListener('dragend', function (ev) {
				console.log("In dragend");
				dragIndex = null;
			});
		}
	}
});