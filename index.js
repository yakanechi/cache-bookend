'use strict';

const hoek = require('hoek');
const { BookendInterface } = require('screwdriver-build-bookend');

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
        const eventCache = hoek.reach(o.job, 'permutations.0.cache.event');

        if (eventCache && eventCache.length > 0) {
            const eventMap = eventCache.map(item =>
              `store-cli get ${item} --type=cache --scope=event`
          );

            return Promise.resolve(eventMap.join(' && '));
        }

        return Promise.resolve('');
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
        const eventCache = hoek.reach(o.job, 'permutations.0.cache.event');

        if (eventCache && eventCache.length > 0) {
            const eventMap = eventCache.map(item =>
                      `store-cli set ${item} --type=cache --scope=event`
                  );

            return Promise.resolve(eventMap.join(' && '));
        }

        return Promise.resolve('');
    }
}

module.exports = CacheBookend;
