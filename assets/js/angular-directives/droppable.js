app.directive('tsDroppable', function () {
	return {
		scope: {
			index: '=',
			allowDrop: '&',
			uponDrop: '&'
		},
		link: function (scope, element) {
			console.log("Linking for droppable");
			var el = element[0];
			var counter = 0;
			el.addEventListener('dragover', function (ev) {
				var allowDrop = scope.allowDrop();
				console.log("In dragover\n");
				if (allowDrop(scope.index)) {
					ev.preventDefault();
				}
			}); //End dragover handler
			el.addEventListener('dragenter', function (ev) {
				ev.preventDefault(); //For IE
				var allowDrop = scope.allowDrop();
				console.log("In dragenter\n");
				if (allowDrop(dragIndex, scope.index)) {
					el.classList.add('dragover');
					counter++;
				}
				// console.log("dragenter. Counter: " + counter);
			});
			el.addEventListener('dragleave', function (ev) {
				var allowDrop = scope.allowDrop();
				console.log("In dragleave\n");
				if (allowDrop(dragIndex, scope.index)) {
					counter--;
					if (counter === 0) el.classList.remove('dragover');
				}
				// console.log("dragleave. Counter: " + counter);
			});
			el.addEventListener("drop", function (ev) {
				el.classList.remove("dragover");
				var drop = scope.uponDrop();
				drop(scope.index);
				counter = 0;
			}); //End drop handler
		}
	}
});