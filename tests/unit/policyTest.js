require('chai').should();
var Promise = require('bluebird');
var req = {
	session: {},
	body: {}
}
var res = {
	forbidden: function () {return false}
};
var next = function () {return true};
function newReq() {
	return {
		session: {},
		body: {}
	}
}
describe('Policy Test', function () {
	req = newReq();

	it("hasCardId", function () {
		var hasCardId = require("../../api/policies/hasCardId.js");
		req = newReq();
		req.body.cardId = 1337;
		// Valid request
		hasCardId(req, res, next).should.equal(true, "Valid request failed hasCardId");
		// Invalid request (missing cardId)
		delete(req.body.cardId);
		hasCardId(req, res, next).should.equal(false, "Passed hasCardId while missing session.cardId property");
		// Invalid request (cardId is not a number)
		req.body.cardId = "1337";
		hasCardId(req, res, next).should.equal(false, "Passed hasCardId while cardId was not a number");
	});

	it("hasCardIdOneAndTwo", function () {
		var hasCardIdOneAndTwo = require("../../api/policies/hasCardIdOneAndTwo.js");
		req = newReq();
		// Valid request
		req.body.cardId1 = 4;
		req.body.cardId2 = 3;
		hasCardIdOneAndTwo(req, res, next).should.equal(true, "Valid request failed hasCardIdOneAndTwo");
		// Invalid request (cardId1 is not a number)
		req.body.cardId1 = '4';
		hasCardIdOneAndTwo(req, res, next).should.equal(false, "Passed hasCardIdOneAndTwo while req.body.cardId1 is not a number");
		// Invalid request (missing cardId1)
		delete(req.body.cardId1);
		hasCardIdOneAndTwo(req, res, next).should.equal(false, "Passed hasCardIdOneAndTwo while missing cardId1 property");
		// Invalid request (cardId2 is not a number)
		req.body.cardId1 = 4;
		req.body.cardId2 = true;
		hasCardIdOneAndTwo(req, res, next).should.equal(false, "Passed hasCardIdOneAndTwo while req.body.cardId2 was not a number");
		// Invalid request (missing cardId2)
		delete(req.body.cardId2);
		hasCardIdOneAndTwo(req, res, next).should.equal(false, "Passed hasCardIdOneAndTwo while missing req.body.cardId2");
	});

	it("hasGameName", function () {
		var hasGameName = require("../../api/policies/hasGameName.js");
		req = newReq();
		// Valid request
		req.body.gameName = "myGame";
		hasGameName(req, res, next).should.equal(true, "Valid request failed hasGameName");
		// Invalid request (req.body.gameName is not a string)
		req.body.gameName = 4;
		hasGameName(req, res, next).should.equal(false, "Passed hasGameName while req.body.gameName is not a string");
		// Invalid request (req.body.gameName missing)
		delete (req.body.gameName);
		hasGameName(req, res, next).should.equal(false, "Passed hasGameName while missing req.body.gameName");
	});

	it("hasOpId", function () {
		var hasOpId = require("../../api/policies/hasOpId.js");
		req = newReq();
		// Valid request
		req.body.opId = 1337;
		hasOpId(req, res, next).should.equal(true, "Valid request failed hasOpId");
		// Invalid request (req.body.opId is not a number)
		req.body.opId = true;
		hasOpId(req, res, next).should.equal(false, "Passed hasOpId while req.body.opId was not a number");
		// Invalid request (missing req.body.opId)
		delete(req.body.opId);
		hasOpId(req, res, next).should.equal(false, "Passed hasOpId while missing req.body.opId");
	});

	it("hasPassword", function () {
		var hasPassword = require("../../api/policies/hasPassword.js");
		req = newReq();
		// Valid request
		req.body.password = "1A2b3cKJI!";
		hasPassword(req, res, next).should.equal(true, "Valid request failed hasPassword");
		// Invalid request (req.body.password is not a string)
		req.body.password = 1347852;
		hasPassword(req, res, next).should.equal(false, "Passed hasPassword while req.body.password is not a string");
		// Invalid request (missing req.body.password)
		delete(req.body.password);
		hasPassword(req, res, next).should.equal(false, "Passed hasPassword while missing req.body.password");
	});

	it("hasTargetId", function () {
		var hasTargetId = require("../../api/policies/hasTargetId");
		req = newReq();
		// Valid request
		req.body.targetId = 1337;
		hasTargetId(req, res, next).should.equal(true, "Valid request failed hasTargetId");
		// Invalid request (req.body.targetId is not a number)
		req.body.targetId = '1337';
		hasTargetId(req, res, next).should.equal(false, "Passed hasTargetId with req.body.targetId not a number");
		// Invalid request (missing req.body.targetId)
		delete(req.body.targetId);
		hasTargetId(req, res, next).should.equal(false, "Passed hasTargetId while missing req.body.targetId");
	});

	it("hasTargetType", function () {
		var hasTargetType = require("../../api/policies/hasTargetType");
		req = newReq();
		// Valid request
		req.body.targetType = "points";
		hasTargetType(req, res, next).should.equal(true, "Valid request failed hasTargetType");
		// Invalid request (req.body.targetType is not a string)
		req.body.targetType = 4;
		hasTargetType(req, res, next).should.equal(false, "Passed hasTargetType while req.body.targetType is not a string");
		// Invalid request (missing req.body.targetType);
		delete(req.body.targetType);
		hasTargetType(req, res, next).should.equal(false, "Passed hasTargetType while missing req.body.targetType");

	});

	it("isLoggedIn", function () {
		var isLoggedIn = require("../../api/policies/isLoggedIn.js");
		// Test valid request (with user and logged in)
		req.session.usr = 4;
		req.session.loggedIn = true;
		isLoggedIn(req, res, next).should.equal(true, "Valid request failed isLoggedIn");
		// Test invalid request (session.usr = null)
		req.session.usr = null;
		isLoggedIn(req, res, next).should.equal(false, "Passed isLoggedIn with session.usr = null");
		// Test invalid request (typeof(session.usr = 'string'))
		req.session.usr = '4';
		isLoggedIn(req, res, next).should.equal(false, "Passed isLoggedIn with typeof(session.usr) = 'string' ");
		// Invalid request (missing usr)
		delete(req.session.usr);
		isLoggedIn(req, res, next).should.equal(false, "Passed isLoggedIn while req.session has no .usr property");
		// Invalid request (missing loggedIn)
		delete(req.session.loggedIn);
		req.session.usr = 4;
		isLoggedIn(req, res, next).should.equal(false, "Passed isLoggedIn while req.session has no .loggedIn property");
		// Invalid request (loggedIn = false)
		req.session.loggedIn = false;
		isLoggedIn(req, res, next).should.equal(false, "Passed isLoggedIn while req.session.loggedIn = false");

	});

	it("isInGame", function () {
		var isInGame = require("../../api/policies/isInGame.js");
		req = newReq();
		req.session.game = 5;
		// Valid request (game = number)
		isInGame(req, res, next).should.equal(true, "Valid request failed isInGame");
		// Invalid request (no session.game property)
		delete(req.session.game);
		isInGame(req, res, next).should.equal(false, "Passed isInGame while missing session.game property");
		// Invalid request (req.session.game is not a number)
		req.session.game = '4';
		isInGame(req, res, next).should.equal(false, "Passed isInGame while session.game was a string");
	});

});
