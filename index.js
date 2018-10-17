'use strict';

const req = require('request');
const hoek = require('hoek');
const { BookendInterface } = require('screwdriver-build-bookend');

class CacheBookend extends BookendInterface {
    /**
     * Constructor for CacheBookend
     * @method constructor
     * @param  {apiUrl} URL of screwdriver API to get job information
     * @return {cacheBookend}
     */
    constructor(apiUrl) {
        super();

        const jobId = process.env.SD_JOB_ID;
        const token = process.env.SD_TOKEN;

        this.options = {
            url: `${apiUrl}/v4/jobs/${jobId}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            json: true
        };
    }

    /**
     * Gives the commands needed for restoring build cache before the build starts.
     * @method getSetupCommand
     * @return {Promise}           Resolves to a string that represents the command to execute
     */
    getSetupCommand() {
        return new Promise((resolve, reject) =>
            req(this.options, (err, response) => {
                if (!err && response.statusCode === 200) {
                    const jobCache = hoek.reach(response.body, 'permutations.0.cache.event');

                    if (jobCache && jobCache.length > 0) {
                        const eventMap = jobCache.map(item =>
                            `store-cli get ${item} --type=cache --scope=event`
                        );

                        return resolve(eventMap.join(' && '));
                    }

                    return resolve('');
                }

                return reject(err);
            })
        );
    }

    /**
     * Gives the commands needed for publishing build cache after a build completes.
     * @method getTeardownCommand
     * @return {Promise}           Resolves to a string that represents the commmand to execute
     */
    getTeardownCommand() {
        return new Promise((resolve, reject) =>
            req(this.options, (err, response) => {
                if (!err && response.statusCode === 200) {
                    const jobCache = hoek.reach(response.body, 'permutations.0.cache.event');

                    if (jobCache && jobCache.length > 0) {
                        const eventMap = jobCache.map(item =>
                            `store-cli set ${item} --type=cache --scope=event`
                        );

                        return resolve(eventMap.join(' && '));
                    }

                    return resolve('');
                }

                return reject(err);
            })
        );
    }
}

module.exports = CacheBookend;
