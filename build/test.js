/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
var jsdom = require('jsdom'),
    fs = require('fs'),
    path = require('path'),
    utils = require('./utils'),
    jWorkflow = require('jWorkflow'),
    moment = require('moment'),
    accounting = require('accounting'),
    jasmine = require('./test/jasmine-node'),
    nodeXMLHttpRequest = require('xmlhttprequest').XMLHttpRequest,
    Q = require('q'),
    _c = require('./conf');

function _extraMocks() {
    global.screen = {
        height: 1600,
        availHeight: 1600,
        width: 1200,
        availWidth: 1200
    };

    global.XMLHttpRequest = window.XMLHttpRequest = nodeXMLHttpRequest;
    require(_c.THIRDPARTY + "Math.uuid");
    global.jWorkflow = jWorkflow;
    global.moment = moment;
    global.accounting = accounting;

    window.navigator.userAgent = "foo";
    window.navigator.geolocation = {};
    window.navigator.javaEnabled = function () {};

    global.location = window.location = {protocol: "http"};
    global.NamedNodeMap = function () {
        return [];
    };
    window.require = require;
    window.removeEventListener = function () {};
}

function _setupEnv(ready) {
    var layout = fs.readFileSync(_c.ASSETS + "client/index.html", "utf-8"),
        thirdparty = [
            _c.THIRDPARTY + "jquery.js",
            _c.THIRDPARTY + "jquery.ui.js"
        ];

    jsdom.env(layout, thirdparty, function (error, window) {
        global.window = window;
        global.document = window.document;
        global.jQuery = window.jQuery;

        global.describeBrowser = function () {
            return global.xdescribe.apply(global, Array.prototype.slice.call(arguments));
        };

        global.itBrowser = function () {
            return global.xit.apply(global, Array.prototype.slice.call(arguments));
        };

        _extraMocks();

        ready();
    });
}

var test = module.exports = function (customPaths, done, opts) {
    if (!opts) { opts = {}; }

    //HACK: this should be  taken out if our pull request in jasmine is accepted.
    jasmine.core.Matchers.prototype.toThrow = function (expected) {
        var result = false,
            exception,
            not = this.isNot ? "not " : "";

        if (typeof this.actual !== 'function') {
            throw new Error('Actual is not a function');
        }
        try {
            this.actual();
        } catch (e) {
            exception = e;
        }
        if (exception) {
            if (typeof expected === 'function') {
                result = expected(exception);
            }
            else {
                result = (expected === jasmine.core.undefined || this.env.equals_(exception.message || exception, expected.message || expected));
            }
        }

        this.message = function () {
            if (exception && (expected === jasmine.core.undefined || !this.env.equals_(exception.message || exception, expected.message || expected))) {
                return ["Expected function " + not + "to throw", expected ? expected.message || expected : "an exception", ", but it threw", exception.message || exception].join(' ');
            } else {
                return "Expected function to throw an exception.";
            }
        };

        return result;
    };

    _setupEnv(function () {
        var targets;

        if (customPaths) {
            targets = [];
            customPaths.forEach(function (customPath) {
                utils.collect(path.join(process.cwd(), customPath), targets);
            });
        } else {
            targets = [_c.ROOT + "test"];
        }

        global.ripple = function (p) {
            return require(path.normalize(path.join(__dirname, "..",
                        (opts.withCoverage ? path.join("cov", "lib") : "lib"), "client")) + "/" + p);
        };

        jasmine.run(targets, function (runner) {
            var failed = runner.results().failedCount === 0 ? 0 : 1;
            (typeof done !== "function" ? process.exit : done)(failed);
        });
    });
};

module.exports.promise = function (customPaths, opts) {
    var d = Q.defer();
    test(customPaths, function (code) {
        if (code) {
            d.reject(code);
        } else {
            d.resolve();
        }
    }, opts);
    return d.promise;
};
