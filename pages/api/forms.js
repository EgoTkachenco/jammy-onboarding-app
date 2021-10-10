// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
let nodemailer = require('nodemailer')
const SUPPORT_MAIL = 'jammy@mail.com'
export default async function handler(req, res) {
  const { type, message } = req.body
  let mailMessage = { from: '', to: 'SUPPORT_MAIL' }
  switch (type) {
    case 'daw':
      mailMessage.subject = 'Daw'
      break
    case 'support':
      mailMessage.subject = 'Support'
      break
  }
}
