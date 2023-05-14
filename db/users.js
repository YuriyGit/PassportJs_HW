const User = require('../models/modelUser')

exports.findById = function (id, cb) {

    process.nextTick(async function () {
        const user = await User.findById(id)

        if (user) {
            cb(null, user)
        } else {
            cb(new Error('User ' + id + ' does not exist'))
        }
    })
}

exports.findByUsername = function (username, cb) {

    process.nextTick(async function () {
        const users = await User.find()
        let len = users.length
        for (let i = 0; i < len; i++) {
            const user = users[i]
            if (user.username === username) {
                return cb(null, user)
            }
        }
        return cb(null, null)
    })
}

exports.verifyPassword = (user, password) => {
    return user.password === password
}