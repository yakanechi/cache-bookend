'use strict';

const assert = require('chai').assert;

describe('index test', () => {
    let bookend;
    let CacheBookend;

    beforeEach(() => {
        // eslint-disable-next-line global-require
        CacheBookend = require('..');

        bookend = new CacheBookend();
    });

    it('constructs', () => {
        assert.ok(bookend);
        assert.property(bookend, 'getSetupCommand');
        assert.property(bookend, 'getTeardownCommand');
    });

    it('getSetupCommand', () =>
        bookend.getSetupCommand({
            job: { permutations: [{
                cache: {
                    event: ['/foo/bar', '/bar/baz']
                }
            }] } }).then(result =>
            assert.strictEqual(result,
            'store-cli get /foo/bar --type=cache --scope=event && ' +
            'store-cli get /bar/baz --type=cache --scope=event')
        )
    );

    it('getTeardownCommand', () =>
        bookend.getTeardownCommand({
            job: { permutations: [{
                cache: {
                    event: ['/foo/bar', '/bar/baz']
                }
            }] } }).then(result =>
            assert.strictEqual(result,
            'store-cli set /foo/bar --type=cache --scope=event && ' +
            'store-cli set /bar/baz --type=cache --scope=event')
        )
    );

    it('getSetupCommand resolves to empty', () =>
        bookend.getSetupCommand({
            job: { permutations: [{}] }
        }).then(result =>
            assert.strictEqual(result, '')
        )
    );

    it('getTeardownCommand resolves to empty', () =>
        bookend.getTeardownCommand({
            job: { permutations: [{}] }
        }).then(result =>
            assert.strictEqual(result, '')
        )
    );
});
