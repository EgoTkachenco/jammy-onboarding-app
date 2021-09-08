// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
let nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport')
const { SMTPClient } = require('emailjs')
const client = new SMTPClient({
  //   user: 'egortkachenco@gmail.com',
  //   password: 'EEcmPdNjCd',
  //   host: 'smtp-pulse.com',
  //   port: '587',
  //   tls: true,

  user: 'username@gmail.com',
  password: 'password',
  host: 'smtp.gmail.com',
  port: '587',
  tls: true,
})
export default async function handler(req, res) {
  //   const transporter = nodemailer.createTransport({
  //     service: 'SendPulse',
  //     host: 'smtp-pulse.com',
  //     port: 2525,
  //     auth: {
  //       user: 'egortkachenco@gmail.com',
  //       pass: 'EEcmPdNjCd',
  //     },
  //   })
  //   const mailData = {
  //     from: 'onboarding-test@jammy.com',
  //     to: 'wecona2353@ppp998.com',
  //     subject: `Message From ${req.body.name}`,
  //     text: req.body.message,
  //     // html: <div>{req.body.message}</div>,
  //   }
  //   console.log(123)
  //   transporter.sendMail(mailData, function (err, info) {
  //     if (err) console.log(err)
  //     else {
  //       console.log(info)
  //       res.status(200).json({ name: 'John Doe' })
  //     }
  //   })
  //   let url = new URLSearchParams('https://api.sendpulse.com/smtp/emails')
  //   url.append('email', JSON.stringify(mailData))
  //   fetch('https://api.sendpulse.com/smtp/emails', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       email: {
  //         html: 'PHA+RXhhbXBsZSB0ZXh0PC9wPg==',
  //         text: 'Example text',
  //         subject: 'Example subject',
  //         from: {
  //           name: 'Example name',
  //           email: 'sender@example.com',
  //         },
  //         to: [
  //           {
  //             name: 'Recipient1 name',
  //             email: 'recipient1@example.com',
  //           },
  //         ],
  //       },
  //     }),
  //   })
  //     .then((res) => {
  //       console.log(res)
  //     })
  //     .catch((err) => console.log('Error ', err))

  client.send(
    {
      text: 'i hope this works',
      from: 'onboarding-test@jammy.com',
      to: 'wecona2353@ppp998.com',
      subject: 'testing emailjs',
    },
    (err, message) => {
      console.log(err || message)
    }
  )
}
