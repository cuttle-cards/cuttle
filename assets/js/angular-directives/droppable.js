app.directive('tsDroppable', function () {
	return {
		scope: {
			index: '=',
			allowDrop: '&',
			uponDrop: '&'
		},
		link: function (scope, element) {
			var el = element[0];
			var counter = 0;
			el.addEventListener('dragover', function (ev) {
				var allowDrop = scope.allowDrop();
				if (allowDrop(scope.index)) {
					ev.preventDefault();
				}
			}); //End dragover handler
			el.addEventListener('dragenter', function (ev) {
				ev.preventDefault(); //For IE
				var allowDrop = scope.allowDrop();
				if (allowDrop(scope.index)) {
					el.classList.add('dragover');
					counter++;
				}
				// console.log("dragenter. Counter: " + counter);
			});
			el.addEventListener('dragleave', function (ev) {
				var allowDrop = scope.allowDrop();
				if (allowDrop(scope.index)) {
					counter--;
					if (counter === 0) el.classList.remove('dragover');
				}
				// console.log("dragleave. Counter: " + counter);
			});
			el.addEventListener("drop", function (ev) {
				// alert("Drop directive handler");
				el.classList.remove("dragover");
				ev.preventDefault();
				var drop = scope.uponDrop();
				// alert("Assigned uponDrop()");
				drop(scope.index);
				// alert("Finished uponDrop() call");
				counter = 0;
				// Reset drag data 
				dragData = {
					type: null,
					index: null,
					rank: null,
					suit: null,
					id: null
				};					
			}); //End drop handler
		}
	}
});