const { transport, SUPPORT_MAIL } = require('./transport')
export default async function handler(req, res) {
  let { email, message } = JSON.parse(req.body)
  let mail = {
    from: 'onboarding@mail.com', // sender address
    to: SUPPORT_MAIL,
    subject: 'Support Form Feedback',
    text: `Email: ${email}\nMessage: ${message}`,
  }
  let info = await transport.sendMail(mail)
  console.log('Message sent: %s', info.messageId)
}
