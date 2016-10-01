var app = angular.module("app", ['ngAnimate']);

var dragIndex = null; //Used to determine which card is being dragged
var dragData = {
	type: null,
	index: null,
	rank: null,
	suit: null,
	id: null
};
