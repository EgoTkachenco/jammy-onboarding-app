import { makeAutoObservable } from 'mobx'
import emailjs from 'emailjs-com'
emailjs.init('user_RXzx7vL8DTPW5Li2pzQGI')
class FormsStore {
  constructor() {
    makeAutoObservable(this)
  }

  isDawFormSended = false
  isSupportFormSended = false

  sendDawForm = async (dawName) => {
    try {
      this.isDawFormSended = true
      await this.sendEmail('template_yj6e2xn', { message: dawName })
    } catch (error) {
      console.log(error)
    }
  }
  sendSupportForm = async (form) => {
    try {
      await this.sendEmail('template_ud3nbuj', {
        email: form.email,
        message: form.message,
      })
      this.isSupportFormSended = true
    } catch (error) {
      console.log(error)
    }
  }

  sendEmail = (templateId, params) => {
    emailjs.send('service_rg242cf', templateId, params)
  }
}
const store = new FormsStore()
export default store
