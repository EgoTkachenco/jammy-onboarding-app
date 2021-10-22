const { transport, SUPPORT_MAIL } = require('./transport')

export default async function handler(req, res) {
  let mail = {
    from: 'onboarding@mail.com', // sender address
    to: SUPPORT_MAIL,
    subject: 'Daw Form Feedback',
    text: req.body.message,
  }
  let info = await transport.sendMail(mail)
  console.log('Message sent: %s', info.messageId)
}
