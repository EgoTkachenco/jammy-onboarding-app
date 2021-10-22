const { transport, SUPPORT_MAIL } = require('./transport')
export default async function handler(req, res) {
  console.log(data)
  let mail = {
    from: 'onboarding@mail.com', // sender address
    to: SUPPORT_MAIL,
    subject: 'Support Form Feedback',
    text: `Email: ${req.body.email}\nMessage: ${req.body.message}`,
  }
  let info = await transport.sendMail(mail)
  console.log('Message sent: %s', info.messageId)
}
