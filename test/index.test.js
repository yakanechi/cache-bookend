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
            'store-cli get /foo/bar --type=cache --scope=event || true ; ' +
            'store-cli get /bar/baz --type=cache --scope=event || true ; ' +
            'echo skipping pipeline cache ; echo skipping job cache')
        )
    );

    it('getSetupCommand with pipeline, job, and event', () =>
        bookend.getSetupCommand({
            job: { permutations: [{
                cache: {
                    event: ['/foo/bar', '/bar/baz'],
                    pipeline: ['/a/b/c'],
                    job: ['/d/f', '/g']
                }
            }] } }).then(result =>
            assert.strictEqual(result,
            'store-cli get /foo/bar --type=cache --scope=event || true ; ' +
            'store-cli get /bar/baz --type=cache --scope=event || true ; ' +
            'store-cli get /a/b/c --type=cache --scope=pipeline || true ; ' +
            'store-cli get /d/f --type=cache --scope=job || true ; ' +
            'store-cli get /g --type=cache --scope=job || true')
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
            'store-cli set /foo/bar --type=cache --scope=event || true ; ' +
            'store-cli set /bar/baz --type=cache --scope=event || true ; ' +
            'echo skipping pipeline cache ; echo skipping job cache')
        )
    );

    it('getTeardownCommand with pipeline, job, and event', () =>
        bookend.getTeardownCommand({
            job: { permutations: [{
                cache: {
                    event: ['/foo/bar', '/bar/baz'],
                    pipeline: ['/a/b/c'],
                    job: ['/d/f', '/g']
                }
            }] } }).then(result =>
            assert.strictEqual(result,
            'store-cli set /foo/bar --type=cache --scope=event || true ; ' +
            'store-cli set /bar/baz --type=cache --scope=event || true ; ' +
            'store-cli set /a/b/c --type=cache --scope=pipeline || true ; ' +
            'store-cli set /d/f --type=cache --scope=job || true ; ' +
            'store-cli set /g --type=cache --scope=job || true')
        )
    );

    it('getSetupCommand resolves to empty', () =>
        bookend.getSetupCommand({
            job: { permutations: [{}] }
        }).then(result =>
            assert.strictEqual(result, 'echo skipping cache')
        )
    );

    it('getTeardownCommand resolves to empty', () =>
        bookend.getTeardownCommand({
            job: { permutations: [{}] }
        }).then(result =>
            assert.strictEqual(result, 'echo skipping cache')
        )
    );
});
