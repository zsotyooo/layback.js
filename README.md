# layback.js

![Layback.js](https://zsotyooo.github.io/layback.js/downloads/psd/logo-dark.png)

As a developer I always kept reusability in mind.

In my everyday work I kept facing the same issues when I had to create some simple javascript code:

> I should be able to somehow pass settings to my object...
> Reaching the dom objects would be nice...
> I should be able to use events observers...
> I can make it as a jQuery plugin with some extra work...
> I have items inside...
> Oh, it should work a different way on mobile...
> Wait, haven't I already done these things before?

So I started thinking. I need a simple, lightweight solution to enpower my javascript objects with different kind of features.
Something like this would be nice:
```javascript
var MyClass = function(options) {
    this.layback(options);
    
    // Do my stuff here
}

layback(MyClass) // At this pont I have data access, observer implementation, and dom access
    .defaults({
        data: {
            dummy: 'foo',
            something: 'cool'
        },
        dom: {
            body: 'body'
        }
    })
    .use('jQuery-plugin', 'myPlugin') // myPlugin jQuery plugin created
    .use('collection') // items and collection methods added
    .make();
```

# Documentation

## Applying layback to your functions
There are two ways to apply the layback features to your function.
#### Adding feautres after creating a function
```javascript
var Creature = function (properties) {
    this.layback(properties);
    this.eat = function() {
        this.dispatch('before-eating');
        this.set('hunger', this.get('hunger')-1);
        this.set('stamina', this.get('stamina')+1);
        this.dispatch('after-eating');
        return this;
    }
}
layback(Creature).make();

var creature = new Creature({hunger: 100, stamina: 10});
creature.eat().get('hunger'); // 99
creature.get('stamina'); // 11
```
#### Creating a function via layback
*Note that the Function will be created globally accessable (in window)*
```javascript
layback('Creature', function (properties) {
    this.layback(properties);
    this.eat = function() {
        //...
    }
}).make();
//...
```
#### Accessing layback features of a function that already uses layback
```javascript
layback(Creature); // => Layback object for the class
Creature.layback(); // Alternative way of getting it
//...
```
#### Accessing layback features of an object that already uses layback
```javascript
var cat = new Creature;
layback(cat) // => Layback object for the object
cat.layback() // Alternative way of getting it
//...
```
## Data handling
Data handling is pretty simple. You can set default values for all the data you'd like to use, and you can use them pretty flexible.
### Setting the default data
The default data sets defaults values to all the data accessable inside the object. You can do it by calling the `defaults` function while adding the layback features.
```javascript
layback('Creature', function(properties) {
    // You can set Default data for the object here. It overrides the default data on the class
    // Note that the format is like this: 'laybackNamespace'
    this.laybackData = {
        hunger: 1
    };
    this.layback(properties);
})
.defaults({ // Set default data on the class
    data: { // This is a data namespace (explained later)
        hunger: 0,
        stamina: 100
    }
})
.make();
var creature = new Creature();
creature.get('hunger'); // 1
creature.get('stamina'); // 100
```
### Adding your own data namespace
```javascript
layback('Creature', function(properties) {
    // You can set Default data for the object here. It overrides the default data on the class
    // Note that the format is like this: 'laybackNamespace'
    this.skinData = {
        hasHair: false
    };
    this.layback(properties)
        .addNs('skinData');
    
    this.skinData; // Object {color:'brown', hasHair: false}
})
.defaults({ // Set default data on the class
    skinData: { // This is your namespace
        color: 'brown',
        hasHair: true
    }
})
.make();
```

## The treats
The treats are adding extra features to your function. This is the heart of layback.js.

There are 2 different kinds of treats:
* **Sytem treats:** Automatically applied on your function when you call `.make()`.
* **Optional treats:** You have to add them yourselves by calling the `.use(treatName)` function.

### Data treat (system)
It allows you to access data inside the object, it also automatically handles the options you pass to the `this.layback(options)` function.
#### Added features
* `get(dataName, [default])`: It gets a data. If it doesnt exist can get the `default` value back.
* `set(dataName, dataValue)`: It sets a data with the key on `dataName`, and the value of `dataValue`.

#### Example usage
```javascript
layback('Creature', function(properties) {
    // You can set/overwrite some default data here as well.
    // It comes in handy when you have to do some pre calculations
    this.laybackData = {
        stamina: Math.round(Math.random() * 100)
    };
    this.layback(properties);
    //...
})
.defaults({
    data: {
        hunger: 0,
        stamina: 100
    }
})
.make();

var creature1 = new Creature; // Using the default data only
creature1.get('hunger'); // 0
creature1.get('stamina'); // 1..100 random number

var creature2 = new Creature({hunger: 50}); // Using custom options
creature2.get('hunger'); // 50
creature2.get('stamina'); // 1..100 random number
```
### Event treat (system)
It's a simple observer implementation.
#### Added features
* `dispatch(eventName, [eventData])`: It fires an avent with `eventName`, and you can dispatch exra data by using the `eventData` argument.
* `observe(eventName, observerFunction)`: It observes the `eventName` event.
The observerFunction recieves the `observee` object, and the `eventData`.

#### Using default observers
```javascript
layback('Creature', function(properties) {
    // You can set/overwrite some default observers here as well
    // It comes in handy when you have to do some pre calculations
    this.laybackCallbacks = {
        afterStopWalking': {
            toDo: function(obj, nextAction){// you can add more observers to the same event
                obj.set('nextAction', nextAction);
            }
        }
    }
    this.layback(properties);
    
    this.startWalking = function() {
        this.set('walking', true);
        this.dispatch('after-start-walking');
    }
    
    this.stopWalking = function(nextAction) {
        this.set('walking', false);
        this.dispatch('after-stop-walking', nextAction);
    }
    
    //...
})
.defaults({
    data: {
        legs: 0
    },
    callbacks: {
        afterStartWalking': {
            canWalk: function(obj, data) {
                if (obj.get('legs') == 0) {
                    obj.stopWalking('idling');
                }
            }
        }
    }
})
.make();

var fish = new Creature({legs: 0});
fish.startWalking(); // The observer has stopped the walking
fish.get('walking'); // false
fish.get('nextAction'); // idling

var cat = new Creature({legs: 4});
cat.startWalking(); // The observer has not stopped the walking
cat.get('walking'); // true
```
#### Using observers on-the-fly
```javascript
cat.observe('after-start-walking', function(obj) {
    obj.liftTail();
});
```
#### Using observers via options
```javascript
layback(Creature).make();
var cat = new Creature({
    legs: 4,
    onAfterStartWalking: function(obj) { // Note that I added 'on' and camelised the event name
        obj.liftTail();
    }
});
```
### DOM treat (system)
You can access the DOM. *It uses jQuery!*
#### Added features
* `dom(elementName [, parentElement])`: gives you a DOM element with the given name (passed as a dom data).

### Using DOM via defaults
```javascript
layback('Creature', function(properties){
    // Set/overwrite defaults here
    this.laybackDom = {
        infoContainer: $("<p class='new-info'></p>").appendTo('body') // note that now it's a jQuery element, not only a selector
    }
    //...
    this.layback(properties);
    
    this.showMood = function(txt) {
        this.dom('infoContainer').html(txt);
    }
    
    this.say = function(txt) {
        this.dom('talkContainer').append($("<p>" + txt + "</p>"));
    }
}).defaults({
    dom: {
        infoContainer: 'p.info',
        talkContainer: '.talk'
    }
})
.make();
var cat = new Creature;
cat.showMood('The cat is hungry!'); // The text appears in p.new-info
cat.say('Feed me!'); // The text appears in .talk
```
### Using DOM via options
```javascript
var dog = new Creature({
    talkContainerElement: '.talk-dog' // Note that I added 'Element' after the dom key
});
dog.showMood('The dog is sad!'); // The text appears in p.new-info
cat.say('Play with me!'); // The text appears in .talk-dog
```
### SetGet treat (optional)
The setget treat provides shorthand setters and getters for your object.
The setters/getters work as explained in the Data treat section.
*It works only with the data provided as default data as well!*
#### Example usage
```javascript
layback(Creature)
.defaults({
    data: {
        legs: 4,
        canSwim: true
    }
})
.use('setget')
.make();

var fish = new Creature;
fish.setLegs(0);
fish.getLegs(); // 0

var cat = new Creature;
cat.setCanSwim(false);
cat.getCanSwim(); // false
```

### Collection treat
Adds collection features to your function object.
#### Added features
* `addCollectionItem(item)`: Adds item(s) to the collection. Accepts any kind of object, array of objects, or jQuery objects
* `getCollectionItem(index)`: Get the item at index position
* `getCollectionItems()`: Retrieves the items
* `removeCollectionItem(item)`: Removes the item from the collection
* `getCollectionSize()`: get the length of the collection
* `eachCollectionItems(callback)`: applies the callback function for each items. See jQuery.each for more info.
* `grepCollectionItems(checkfunction)`: Greps items from the collection. See jQuery.grep for more info.
* `sliceCollectionItems(begin[, end, callback])`: Gets a slice of the collection items from `begin` to `end`, and applies `callback` to them
* `setPagerLimit(limit)`: Sets the pages size.
* `setPageItems(page)`: gets the items at `page` page.

#### Example usage
```javascript
layback(Creature).use('collection').make();

var obj = new Creature;
// You can add Object, Array of Objects, jQuery objects here
obj.addCollectionItem($('.item'));
obj.getCollectionItems(); // the items
obj.getCollectionItemPosition($('.item')[2]); // 3
obj.removeCollectionItem($('.item')[1]); // removes the item
obj.getCollectionSize(); // collection length

obj.eachCollectionItems(function(i, item){
    $(item).addClass((i % 2) ? 'odd' : 'even');
}); // adding even and odd casses

obj.grepCollectionItems(function(item) {
  return !$(item).hasClass('even');
})); // get every second element

obj.sliceCollectionItems(30, 40, function(i, item){
    $(item).css('background', 'red');
}); // Set red bg to items 30..40

obj.setPagerLimit(10);
obj.getPageItems(2); // get elements 10..20 
```

### Responsive features
Using this treat you can change the data inside the object based the window width breakpoints.
In addition you can set responders which run only if you are on the defined breakpoint.
#### Added features
* `getCurrentBreakpoint()`: get the current breakpoint, and width. e.g: {name: 'tablet', width: 760}
* `respondTo(breakpoint, callback)`: Add a `callback` which only applied when you anter the `breakpoint` zone.

#### Example usage
```javascript
layback(Creature)
    .defaults({
        data: {
            renderWidth: 1000
        },
        breakpoints: {
            mobile: {
                width: 760, 
                data: {
                    renderWidth: 300
                }
            },
            tablet: {
                width: 980, 
                data: {
                    renderWidth: 900
                }
            }
        }
    })
    .use('respond')
    .make();

var obj = new Creature;
obj.respondTo('mobile', function(){
    console.log(
        this.getCurrentBreakpoint().name
        + ':' + this.get('renderWidth')
    );
});
obj.respondTo('tablet', function(){
    console.log(
        this.getCurrentBreakpoint().name
        + ':' + this.get('renderWidth')
    );
});
// below 760px> mobile:300, above 760px> tablet:900
```


### JQuery plugin features
You can create a jQuery plugin from your object using this treat.
The idea behind this is either you provide an element to your object, or JQuery does it for you.
If you call your plugin on multiple elements, an object will be created for each of them, so you can avoid the common mistake that your plugin works only with the same matching element.

#### Added features
* `getJqueryPluginObject(element)`: Its a class method. Meaning that you function will have this rather than you object. If you provide the `element` here you will get your object back.
* `getJqueryPluginObjects(elements)`: Its a class method. Meaning that you function will have this rather than you object. If you provide the `element` here you will get an `Array` containing your objects.

#### Example usage
##### Javascript
```javascript
layback('SetTexTContent', function(properties) {
        this.laybacy(properties);
        this.getElement().html(this.get('text'));
    })
    .use('jQuery-plugin', 'setTextContent')
    .make();
```

```HTML
    <ul class="my-list">
        <li></li>
        <li setTextContent-options="{text:'Custom text'}"></li>
        <li></li>
    </ul>
```
##### HTML
```javascript
$('.my-list li').setTextContent({text: 'Just a text'});

// Getting the objects back from the elements
SetTexTContent.getJqueryPluginObject($('.my-list li')[0]); // SetTexTContent {...}
SetTexTContent.getJqueryPluginObjects($('.my-list li')); // [SetTexTContent {...}, SetTexTContent {...}, SetTexTContent {...}]
```
##### Result
```HTML
    <ul class="my-list">
        <li>Just a text</li>
        <li setTextContent-options="{text:'Custom text'}">Custom text</li>
        <li>Just a text</li>
    </ul>
```
##### Using it without using it as a plugin
```javascript
// Notice that I had to provide the element as an option
 var mySetTextObj = new SetTexTContent({text: 'Just a text', element: '.my-list li:eq(0)'});
```
