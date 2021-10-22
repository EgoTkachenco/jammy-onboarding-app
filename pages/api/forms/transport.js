const nodemailer = require('nodemailer')
var transport = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
    user: 'egortkachenco@gmail.com',
    pass: 'NdBDcJSmy9PQHKE7',
  },
})
// const SUPPORT_MAIL = 'jammy@mail.com'
const SUPPORT_MAIL = 'egortkachenco@gmail.com'

module.exports = { transport, SUPPORT_MAIL }
