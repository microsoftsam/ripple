/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
describe("webworks identity.Service", function () {
    var spec = require('ripple/platform/webworks.handset/2.0.0/spec');

    describe("in spec", function () {
        it("includes Service module according to proper object structure", function () {
            expect(spec.objects.blackberry.children.identity.children.Service.path)
                .toEqual("webworks.handset/2.0.0/client/identity/Service");
        });
    });
});
