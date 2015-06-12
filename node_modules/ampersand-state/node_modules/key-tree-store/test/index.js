var test = require('tape');
var KeyTree = require('../key-tree-store');


test('`add` should store objects', function (t) {
    var tree = new KeyTree();
    var one = {id: 'one'};
    var two = {id: 'two'};
    var three = {id: 'three'};
    var four = {id: 'four'};

    tree.add('first', one);
    tree.add('first.second', two);
    tree.add('first.second', three);
    tree.add('first.second.third', four);

    t.equal(Object.keys(tree.storage).length, 3);

    t.equal(tree.storage['first.second'].length, 2, 'should be two for `first.second` key');
    t.equal(tree.get().length, 4, 'should return all');
    t.equal(tree.get('first').length, 4, 'should be 4 that match');
    t.equal(tree.get('first.second').length, 3, 'should be 3 that match');
    t.equal(tree.get('first.second.third').length, 1, 'should be 1 that match');

    t.equal(tree.get('second.third').length, 0, 'keypaths should start at the start');

    t.equal(tree.get('first.seco').length, 0, 'keypaths must be the full path, or end in a . to match');

    t.deepEqual(tree.getGrouped('first.second'), {
        'first.second': [two, three],
        'first.second.third': [four]
    });

    t.deepEqual(tree.getGrouped(), {
        'first': [one],
        'first.second': [two, three],
        'first.second.third': [four]
    });

    tree.remove(two);
    t.equal(tree.get('first').length, 3, 'should be 3 that match after removal');


    t.end();
});

test('`run`', function (t) {
    var tree = new KeyTree();
    var oneRan, twoRan;
    var oneContext, twoContext;
    var oneArgs;
    var one = function () {
        oneRan = true;
        oneContext = this;
        oneArgs = arguments;
    };
    var two = function () {
        twoRan = true;
        twoContext = this;
    };

    function reset() {
        oneRan = false;
        twoRan = false;
        oneContext = null;
        twoContext = null;
    }

    reset();

    tree.add('one', one);
    tree.add('two', two);

    tree.run();

    t.ok(oneRan);
    t.ok(twoRan);

    reset();

    tree.run('one');
    t.ok(oneRan);
    t.notOk(twoRan);

    reset();

    var context = {};
    tree.run('one', context, 'hello', 'world');
    t.equal(oneContext, context);
    t.equal(oneArgs[0], 'hello');
    t.equal(oneArgs[1], 'world');

    t.end();
});
