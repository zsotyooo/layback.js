"use strict";

describe('The layback method addition (addMethod, addInitMethod, addClassMethod)', function() {
	/*
	Scenario: The user adds an init method to his function
	Given I have a function that uses layback
		And I call addInitMethod with a function as an argument on the layback object
	When I create a new instance from my object
		And I call layback on my object
			Then the function should be called with an argument which is the instance itself
	 */
	context('The user adds an init method to his function', function() {

		var MyFunc = function(){},
			myFuncLayback,
			myObj,
			myObjLayback,
			initMethod = sinon.spy();

		
		/*
		Given I have a function that uses layback
		And I call addInitMethod with a function as an argument on the layback object
		 */
		before(function(){
			myFuncLayback = layback(MyFunc)
				.addInitMethod(initMethod)
				.make();
			myObj = new MyFunc,
			myObjLayback = layback(myObj);
		});

		describe('When I call layback on my instance', function() {

			it("the function should be called with an argument which is the instance itself", function() {
				expect(initMethod.firstCall.calledWith(myObj)).to.be.true;
			});
		});
	});

	/*
	Scenario: The user adds a method to his function
	Given I have a function that uses layback
	When I call addClassMethod with a function name and a function as arguments on the layback object
		Then a method should be added to my function with the name of function name which is the function
	When I call addClassMethod with the same function name
		Then I should get an exception
	When I call addClassMethod with the same function name, and a third parameter forced=true
		Then a method should be added to my function with the name of function name which is the function
	 */
	context('The user adds a method to his function', function() {

		var MyFunc = function(){},
			myFuncLayback,
			classMethod = sinon.spy();

		
		/*
		Given I have a function that uses layback
		 */
		before(function(){
			myFuncLayback = layback(MyFunc)
				.addClassMethod('testClassMethod', classMethod)
				.make();
		});

		describe('When I call addClassMethod with a function name and a function as arguments on the layback object', function() {
			
			it("a method should be added to my function with the name of function name which is the function", function() {
				expect(MyFunc).to.have.property('testClassMethod');
				MyFunc.testClassMethod();
				expect(classMethod.called).to.be.true;
			});
		});

		describe('When I call addClassMethod with the same function name', function() {
			
			it("i should get an exception", function() {
				expect(function() {
					myFuncLayback.addClassMethod('testClassMethod', function(){});
				}).to.throw(Error);
			});
		});

		describe('When I call addClassMethod with the same function name, and a third parameter forced=true', function() {
			var overWrittenClassMethod = sinon.spy();
			it("a method should be added to my function with the name of function name which is the function", function() {
				myFuncLayback.addClassMethod('testClassMethod', overWrittenClassMethod, true);
				MyFunc.testClassMethod();
				expect(overWrittenClassMethod.called).to.be.true;
			});
		});
	});

	/*
	Scenario: The user adds a method to his function instances
	Given I have a function that uses layback
	When I call addMethod with a function name and a function as arguments on the layback object
		Then a method should be added to my function's prototype with the name of function name which is the function
	When I call addMethod with the same function name
		Then I should get an exception
	When I call addMethod with the same function name, and a third parameter forced=true
		Then a method should be added to my function's prototype with the name of function name which is the function
	 */
	context('The user adds a method to his function instances', function() {

		var MyFunc = function(){},
			myFuncLayback,
			myObj,
			myObjLayback,
			objMethod = sinon.spy();

		
		/*
		Given I have a function that uses layback
		 */
		before(function(){
			myFuncLayback = layback(MyFunc)
				.addMethod('testMethod', objMethod)
				.make();
			myObj = new MyFunc;
			myObjLayback = layback(myObj);
		});

		describe("When I call addMethod with a function name and a function as arguments on the layback object", function() {
			
			it("a method should be added to my function's prototype with the name of function name which is the function", function() {
				expect(myObj).to.have.property('testMethod');
				myObj.testMethod();
				expect(objMethod.called).to.be.true;
			});
		});

		describe('When I call addMethod with the same function name', function() {
			
			it("i should get an exception", function() {
				expect(function() {
					myFuncLayback.addMethod('testMethod', function(){});
				}).to.throw(Error);
			});
		});

		describe('When I call addMethod with the same function name, and a third parameter forced=true', function() {
			var overWrittenMethod = sinon.spy();
			it("a method should be added to my function with the name of function name which is the function", function() {
				myFuncLayback.addMethod('testMethod', overWrittenMethod, true);
				myObj = new MyFunc;
				layback(myObj);
				myObj.testMethod();
				expect(overWrittenMethod.called).to.be.true;
			});
		});
	});
});