/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    wipeDatabase: function(req, res) {
        return Promise.all([Game.destroy({}), User.destroy({}), Card.destroy({})])
        .then((values) => {
            return res.ok();
        })
        .catch((err) => {
            return res.badRequest(err);
        });
    },
};

