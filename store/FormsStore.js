import { makeAutoObservable } from 'mobx'
import './email'
class FormsStore {
  constructor() {
    makeAutoObservable(this)
  }

  isDawFormSended = false
  isSupportFormSended = false

  sendDawForm = async (dawName) => {
    try {
      this.isDawFormSended = true
      await fetch('/api/forms/daw', {
        method: 'POST',
        body: JSON.stringify({ message: dawName }),
      })
    } catch (error) {
      console.log(error)
    }
  }
  sendSupportForm = async (form) => {
    console.log('Support form: ', form)
    let data = new FormData()
    data.append('email', form.email)
    data.append('message', form.message)
    data.append('file', form.file)
    try {
      this.isSupportFormSended = true
      await fetch('/api/forms/support', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, message: form.message }),
      })
    } catch (error) {
      console.log(error)
    }
  }
}
const store = new FormsStore()
export default store
