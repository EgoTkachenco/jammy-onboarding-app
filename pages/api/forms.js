const nodemailer = require('nodemailer')
var transport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '65d1b4d3d2d3a6',
    pass: '05d02742d43b94',
  },
})
const SUPPORT_MAIL = 'jammy@mail.com'
export default async function handler(req, res) {
  const { type, message } = JSON.parse(req.body)
  let mail = {
    from: 'Onboarding App', // sender address
    to: SUPPORT_MAIL,
  }
  switch (type) {
    case 'daw':
      mail.subject = 'Daw'
      mail.text = message
      break
    case 'support':
      mail.subject = 'Support'
      mail.text = message
      break
  }
  let info = await transport.sendMail(mail)

  console.log('Message sent: %s', info.messageId)
}
