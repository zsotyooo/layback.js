"use strict";

describe('The layback namespaces (defaults, addNs, getNs)', function() {

	/*
	Scenario: The user adds default data to his function
	Given I have a function that uses layback
		And I added defualt values to it by calling the defaults function on my layback object
	When I call getDefaults on my layback object
		Then I should get the default Values back
	 */
	context('The user adds default data to his function', function() {

		var MyFunc = function(){},
			myFuncLayback,
			defaultsValues = {namespace1: {}, namespace2: {}};

		/*
		Given I have a function that uses layback
		And I added defualt values to it by calling the defaults function on my layback object
		 */
		before(function(){
			myFuncLayback = layback(MyFunc)
				.defaults(defaultsValues)
				.make();
		});

		describe('When I call getDefaults on my layback object', function() {
			
			it("i should get the dafault values back", function() {
				expect(myFuncLayback.getDefaults()).to.be.equal(defaultsValues);
			});
		});
	});

	/*
	Scenario: The user can define namespaces
	Given I have a function that uses layback
		And I added defualt values to it by calling the defaults function on my layback object
		And I have an instance of my function
		And I call addNs with a namepace name, and data on my instance's layback object
	When I call getNs on my instance's layback object with the same namespace name
		I should get an object back with the dafault values' data at the key of namespace name, owerwritten by the data parameter of the addNs function
		I should have the same same object as a property of my instance, under the key of layback + ucfirst namespace name 
	 */
	context('The user adds default data to his function', function() {

		var MyFunc = function(){},
			myFuncLayback,
			nsDefValues = {
				value1: 0,
				value2: 0
			},
			nsUserValues = {
				value1: 1,
				value3: 1
			},
			defaultsValues = {
				testNamespace: nsDefValues
			},
			myObj,
			myObjLayback;

		/*
		Given I have a function that uses layback
		And I added defualt values to it by calling the defaults function on my layback object
		And I have an instance of my function
		And I call addNs with a namepace name, and data on my instance's layback object
		 */
		before(function(){
			myFuncLayback = layback(MyFunc)
				.defaults(defaultsValues)
				.make();
			myObj = new MyFunc;
			myObjLayback = layback(myObj);
			myObjLayback.addNs('testNamespace', nsUserValues);
		});

		describe("When I call getNs on my instance's layback object with the same namespace name", function() {
			
			it("I should get an object back with the dafault values' data at the key of namespace name, owerwritten by the data parameter of the addNs function", function() {
				expect(myObjLayback.getNs('testNamespace')).to.be.deep.equal({
					value1: 1,
					value2: 0,
					value3: 1
				});
			});

			it("I should have the same same object as a property of my instance, under the key of layback + ucfirst namespace name", function() {
				expect(myObj.laybackTestNamespace).to.be.deep.equal({
					value1: 1,
					value2: 0,
					value3: 1
				});
			});
		});
	});

});