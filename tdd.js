console.clear();

function assert(condition, message) {
    if (!condition) {
        console.log(message);
        throw new Error(message ? message : '');
    }
}

let TestCase = (function () {
    function TestCase(name) {
        this.name = name;
    }

    TestCase.prototype.run = function (result) {
        result.testStarted();

        this.setUp();
        try {
            this[this.name]();
        } catch (error) {
            result.testFailed();
        }
        this.tearDown();

        return result;
    }

    return TestCase;
})();

let TestSuite = (function () {
    function TestSuite() {
        this.tests = [];
    }

    TestSuite.prototype.add = function (test) {
        this.tests.push(test);
    }

    TestSuite.prototype.run = function (result) {
        for (let test of this.tests) {
            test.run(result);
        }
    }

    return TestSuite;
})();

let WasRun = (function () {
    function WasRun(name) {
        TestCase.call(this, name);
        this.wasSetUp = false;
    }
    WasRun.prototype = Object.create(TestCase.prototype);
    WasRun.prototype.constructor = WasRun;

    WasRun.prototype.testMethod = function () {
        this.wasRun = true;
        this.counter++;
        this.log = this.log + 'testMethod ';
    }

    WasRun.prototype.testBrokenMethod = function () {
        throw new Error();
    }

    WasRun.prototype.setUp = function () {
        this.wasRun = false;
        this.wasSetUp = true;
        this.log = 'setUp ';
    }

    WasRun.prototype.tearDown = function () {
        this.log = this.log + 'tearDown ';
    }

    return WasRun;
})();

let TestResult = (function () {
    function TestResult() {
        this.runCount = 0;
        this.errorCount = 0;
    }

    TestResult.prototype.testStarted = function () {
        this.runCount++;
    }

    TestResult.prototype.testFailed = function () {
        this.errorCount++;
    }

    TestResult.prototype.summary = function () {
        return `${this.runCount} run, ${this.errorCount} failed`;
    }

    return TestResult;
})();

let TestCaseTest = (function () {
    function TestCaseTest(name) {
        TestCase.call(this, name);
    }
    TestCaseTest.prototype = Object.create(WasRun.prototype);
    TestCaseTest.prototype.constructor = TestCaseTest;

    TestCaseTest.prototype.setUp = function () {
        this.result = new TestResult();
    }

    TestCaseTest.prototype.testTemplateMethod = function () {
        let test = new WasRun('testMethod');
        test.run(this.result);

        let expect = 'setUp testMethod tearDown ';
        assert(test.log === expect, `${this.name}: expect "${expect}", result: "${test.log}"`);
    }

    TestCaseTest.prototype.testResult = function () {
        let test = new WasRun('testMethod');
        test.run(this.result);

        let expect = '1 run, 0 failed';
        assert(this.result.summary() === expect, `${this.name}: expect "${expect}", result: "${this.result.summary()}"`);
    }

    TestCaseTest.prototype.testFailedResult = function () {
        let test = new WasRun('testBrokenMethod');
        test.run(this.result);

        let expect = '1 run, 1 failed';
        assert(this.result.summary() === expect, `${this.name}: expect "${expect}", result: "${this.result.summary()}"`);
    }

    TestCaseTest.prototype.testFailedResultFormatting = function () {
        this.result.testStarted();
        this.result.testFailed();

        let expect = '1 run, 1 failed'
        assert(this.result.summary() === expect, `${this.name}: expect "${expect}", result: "${this.result.summary()}"`);
    }

    TestCaseTest.prototype.testSuite = function () {
        let suite = new TestSuite();
        suite.add(new WasRun('testMethod'));
        suite.add(new WasRun('testBrokenMethod'));
        suite.run(this.result);

        let expect = '2 run, 1 failed';

        assert(expect === this.result.summary(), `${this.name}: expect "${expect}", result: "${this.result.summary()}"`);
    }

    return TestCaseTest;
})();

let suite = new TestSuite();
suite.add(new TestCaseTest('testTemplateMethod'));
suite.add(new TestCaseTest('testResult'));
suite.add(new TestCaseTest('testFailedResultFormatting'));
suite.add(new TestCaseTest('testFailedResult'));
suite.add(new TestCaseTest('testSuite'));
let result = new TestResult();
suite.run(result);
console.log(result.summary());



let DBTest = (function () {
    function DBTest (name) {
        TestCase.call(this, name);
    }
    DBTest.prototype = Object.create(WasRun.prototype);
    DBTest.prototype.constructor = DBTest;

    DBTest.prototype.testConnection = function () {
        let expect = 'connected';
        let result = 'aborted';

        assert(expect === result, `${this.name}: expect "${expect}", result: "${result}"`);
    }

    return DBTest;
})();

let dbSuite = new TestSuite();
dbSuite.add(new DBTest('testConnection'));
let dbResult = new TestResult();
dbSuite.run(dbResult);
console.log(dbResult.summary());
