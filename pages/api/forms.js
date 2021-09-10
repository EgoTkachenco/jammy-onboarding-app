// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
let nodemailer = require('nodemailer')
const SUPPORT_MAIL = 'jammy@mail.com'
// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: 'egortkachenco@gmail.com',
//     pass: '',
//   },
// })

export default async function handler(req, res) {
  const { type, message } = req.body
  let mailMessage = {from: '', to: 'SUPPORT_MAIL'};
  switch (type) {
    case 'daw':
      mailMessage.subject = 'Daw'
      break
    case 'support':
      mailMessage.subject = 'Support'
      break
  }
  
  // const mailData = {
  //   from: 'egortkachenco@gmail.com',
  //   to: 'heyibat343@rebation.com',
  //   subject: `Message From ${req.body.name}`,
  //   text: req.body.message,
  //   // html: <div>{req.body.message}</div>,
  // }
  // transporter.sendMail(mailData, function (err, info) {
  //   if (err) console.log(err)
  //   else {
  //     console.log(info)
  //     res.status(200).json({ name: 'John Doe' })
  //   }
  // })
}
