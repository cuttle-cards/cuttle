app.directive('tsDraggable', function () {
	return {
		scope: {
			type: '=',
			index: '=',
			suit: '=',
			rank: '=',
			cardId: '='
		},
		link: function (scope, element) {
			var el = element[0];
			el.addEventListener('dragstart', function (ev) {
				dragData = {
					type: scope.type,
					index: scope.index,
					suit: scope.suit,
					rank: scope.rank,
					id: scope.cardId
				};
			});
			el.addEventListener('dragend', function (ev) {
				dragData = {
					type: null,
					index: null,
					rank: null,
					suit: null,
					id: null
				};				
			});
		}
	}
});