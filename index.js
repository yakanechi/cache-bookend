'use strict';

const hoek = require('@hapi/hoek');
const { BookendInterface } = require('screwdriver-build-bookend');

/**
 * Get cache commands that call the store-cli for approrpiate scope
 * @method getCacheCommands
 * @param  {Array}        cache   Array of cacheKeys
 * @param  {String}       scope   Cache scope
 * @param  {String}       action  Set or Get
 * @return {String}       Commands to call store-cli
 */
function getCacheCommands(cache, scope, action, enabled) {
    const isEnabled = (enabled === "true")
    if (isEnabled && cache && cache.length > 0) {
        const cmds = cache.map(item => `store-cli ${action} ${item} --type=cache --scope=${scope} || true`);

        return cmds.join(' ; ');
    }

    return `echo skipping ${scope} cache`;
}

class CacheBookend extends BookendInterface {
    /**
     * Gives the commands needed for restoring build cache before the build starts.
     * @method getSetupCommand
     * @param  {Object}         o           Information about the environment for setup
     * @param  {PipelineModel}  o.pipeline  Pipeline model for the build
     * @param  {JobModel}       o.job       Job model for the build
     * @param  {Object}         o.build     Build configuration for the build (before creation)
     * @return {Promise}        Resolves to a string that represents the command to execute
     */
    getSetupCommand(o) {
        const cache = hoek.reach(o.job, 'permutations.0.cache');
        const env = hoek.reach(o.job, 'permutations.0.environment')

        if (cache) {
            const pipelineCache = getCacheCommands(cache.pipeline, 'pipeline', 'get', env.CACHE_PIPELINE_SETUP);
            const eventCache = getCacheCommands(cache.event, 'event', 'get', env.CACHE_EVENT_SETUP);
            const jobCache = getCacheCommands(cache.job, 'job', 'get', env.CACHE_JOB_SETUP);

            return Promise.resolve(`${pipelineCache} ; ${eventCache} ; ${jobCache}`);
        }

        return Promise.resolve('echo skipping cache');
    }

    /**
     * Gives the commands needed for publishing build cache after a build completes.
     * @method getTeardownCommand
     * @param  {Object}         o           Information about the environment for setup
     * @param  {PipelineModel}  o.pipeline  Pipeline model for the build
     * @param  {JobModel}       o.job       Job model for the build
     * @param  {Object}         o.build     Build configuration for the build (before creation)
     * @return {Promise}        Resolves to a string that represents the commmand to execute
     */
    getTeardownCommand(o) {
        const cache = hoek.reach(o.job, 'permutations.0.cache');
        const env = hoek.reach(o.job, 'permutations.0.environment')

        if (cache) {
            const pipelineCache = getCacheCommands(cache.pipeline, 'pipeline', 'set', env.CACHE_PIPELINE_TEARDOWN);
            const eventCache = getCacheCommands(cache.event, 'event', 'set', env.CACHE_EVENT_TEARDOWN);
            const jobCache = getCacheCommands(cache.job, 'job', 'set', env.CACHE_JOB_TEARDOWN);

            return Promise.resolve(`${pipelineCache} ; ${eventCache} ; ${jobCache}`);
        }

        return Promise.resolve('echo skipping cache');
    }
}

module.exports = CacheBookend;
