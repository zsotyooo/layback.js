'use strict';

describe('The layback function', function() {

	/*
	Scenario: The user passes only a function as an argument
	Given I have a function
	When I pass my function as an only argument to layback
		Then It should add a method called 'layback' to my function
			And it should return an object with methods ['use', 'defaults', 'addInitMethod', 'addClassMethod', 'addMethod', 'make']
	When I call layback on my function
		Then It should return the same object
	 */
	describe('The user passes only a function as an argument', function() {
		// Given I have a function
		var MyFunc = function(){},
			myFuncLayback;
		
		before(function(){
			myFuncLayback = layback(MyFunc).make();
		});

		context('When I pass my function as an only argument to layback', function() {

			it("it should add a method called 'layback' to my function", function() {
				expect(MyFunc).to.have.property('layback');
			});
			
			$.each(['use', 'defaults', 'addInitMethod', 'addClassMethod', 'addMethod', 'make'], function(i, methodName) {
				it("and it should return an object with method " + methodName, function() {
					expect(myFuncLayback).to.have.property(methodName);
					expect(myFuncLayback[methodName]).to.be.a('Function');
				});
			});
			
		});

		context('When I call layback on my function again', function() {

			it("it should return the same object", function() {
				expect(layback(MyFunc)).to.be.equal(myFuncLayback);
			});
		});
	});

	/*
	Scenario: The user passes a function name and a function as the arguments
	Given I don't have a function yet
		And I want to create one, that already uses layback
	When I pass a function name, and a function to layback
		Then It should create a function with the name on the name provided
			And layback should be applied to the function
	 */
	describe('The user passes a function name and a function as the arguments', function() {
		var myCreatedFuncLayback;

		// Given I don't have a function yet
		// Create one here
		before(function() {
			myCreatedFuncLayback = layback('MyCreatedFunc', function(){}).make();
		});

		context('When I pass a function name, and a function to layback', function() {

			it('it should create a function with the name on the name provided', function() {
				expect(window.MyCreatedFunc).not.to.be.undefined;
				expect(window.MyCreatedFunc).to.be.a('Function');
			});

			it("it should add a method called 'layback' to my function", function() {
				expect(window.MyCreatedFunc).to.have.property('layback');
			});
			
			$.each(['use', 'defaults', 'addInitMethod', 'addClassMethod', 'addMethod', 'make'], function(i, methodName) {
				it("it should return an object with method " + methodName, function(){
					expect(myCreatedFuncLayback).to.have.property(methodName);
					expect(myCreatedFuncLayback[methodName]).to.be.a('Function');
				});
			});
		});
	});

	/*
	Scenario: The user passes no arguments to layback
	Given I'd like to use the globally accessable features of layback
	When I pass no parameters to layback
		Then It should return an object with layback features
			And this object should contain the tools
			And this object should contain the user treats
			And this object should contain the system treats
			And this object should contain the object pool
	 */
	describe('The user passes no arguments to layback', function() {
		var laybackGlobalAccess;

		// Given I'd like to use the globally accessable features of layback
		before(function() {
			laybackGlobalAccess = layback();
		});

		context('When I pass no parameters to layback', function() {

			it('It should return an object with layback features', function() {
				expect(laybackGlobalAccess).to.be.an('Object');
			});
			
			$.each(['tools', 'treats', 'systemTreats', 'objectPool'], function(i, methodName) {
				it("this object should contain the " + methodName, function() {
					expect(laybackGlobalAccess).to.have.property(methodName);
					expect(laybackGlobalAccess[methodName]).to.be.an('Function');
				});
			});
		});
	});

	/*
	Scenario: The user passes one object as the first argumnet
	Given I have a function that uses layback
		And I create an instance of it
	When I call layback on my instance
		Then It should return an object
			And it should return an object with methods ['addNs', 'getOptions', 'setOptions']
	And When I call instance.layback
		Then it should return the same object
	And When I call layback on my instance again
		Then it should return the same object
	 */
	 describe('The user passes an object as the first argumnet', function() {
		// Given I have a function
		var MyFunc = function(){},
			myFuncLayback,
			myObj,
			myObjLayback;
		
		/*
		Given I have a function that uses layback
		And I create an instance of it
		 */
		before(function(){
			myFuncLayback = layback(MyFunc).make();
			myObj = new MyFunc,
			myObjLayback = layback(myObj);
		});

		context('When I call layback on my instance', function() {

			it("It should return an object", function() {
				expect(myObjLayback).to.be.an('Object');
			});

			$.each(['addNs', 'getOptions', 'setOptions'], function(i, methodName) {
				it("and it should return an object with method " + methodName, function() {
					expect(myObjLayback).to.have.property(methodName);
					expect(myObjLayback[methodName]).to.be.an('Function');
				});
			});
		});

		context('When I call instance.layback', function() {
			it("it should return the same object", function() {
				expect(myObj.layback()).to.be.equal(myObjLayback);
			});
		});

		context('When I call layback on my instance again', function() {

			it("it should return the same object", function() {
				expect(layback(myObj)).to.be.equal(myObjLayback);
			});
		});
	});
});