app.directive('tsDraggable', function () {
	return {
		scope: {
			type: '=',
			index: '=',
			suit: '=',
			rank: '=',
			cardId: '=',
			uponDrag: '&',
			dragEnd: '&',
		},
		link: function (scope, element) {
			var el = element[0];
			el.addEventListener('dragstart', function (ev) {
				// console.log("Dragstart:");
				// console.log(scope.index);
				dragData = {
					type: scope.type,
					index: scope.index,
					suit: scope.suit,
					rank: scope.rank,
					id: scope.cardId
				};
				// console.log(dragData);
				uponDrag = scope.uponDrag();
				uponDrag();
			});
			el.addEventListener('dragend', function (ev) {
				dragEnd = scope.dragEnd();
				dragEnd();
				// alert("drag end");
				// dragData = {
				// 	type: null,
				// 	index: null,
				// 	rank: null,
				// 	suit: null,
				// 	id: null
				// };				
			});
		}
	}
});