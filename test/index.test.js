/* Inline JSHint configuration for Mocha globals. */
/* global describe, it, beforeEach */ // All Mocha globals.

'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const mockery = require('mockery');

describe('index test', () => {
    let bookend;
    let reqMock;
    let CacheBookend;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        reqMock = sinon.stub().yields(null, {
            statusCode: 200,
            body: {
                permutations: [
                    {
                        cache: {
                            event: ['foo/bar', 'bar/baz']
                        }
                    }
                ]
            }
        });

        mockery.registerMock('request', reqMock);

        // eslint-disable-next-line global-require
        CacheBookend = require('..');

        bookend = new CacheBookend('https://api.screwdriver.ouroath.com/');
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
    });

    after(() => {
        mockery.disable();
    });

    it('constructs', () => {
        assert.ok(bookend);
        assert.property(bookend, 'getSetupCommand');
        assert.property(bookend, 'getTeardownCommand');
    });

    it('getTeardownCommand', () =>
        bookend.getTeardownCommand().then(result =>
            assert.strictEqual(result,
            'store-cli set foo/bar --type=cache --scope=event && ' +
                'store-cli set bar/baz --type=cache --scope=event')
        )
    );

    it('getSetupCommand', () =>
        bookend.getSetupCommand().then(result =>
            assert.strictEqual(result,
            'store-cli get foo/bar --type=cache --scope=event && ' +
                'store-cli get bar/baz --type=cache --scope=event')
        )
    );
});
