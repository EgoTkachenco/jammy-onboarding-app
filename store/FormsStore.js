import { makeAutoObservable } from 'mobx'

class FormsStore {
  constructor() {
    makeAutoObservable(this)
  }

  isDawFormSended = false
  isSupportFormSended = false

  sendDawForm = async (dawName) => {
    debugger
    let data = { type: 'daw', message: dawName }
    try {
      this.isDawFormSended = true
      await fetch('/api/forms', { method: 'POST', body: JSON.stringify(data) })
    } catch (error) {
      console.log(error)
    }
  }
  sendSupportForm = (form) => {
    console.log('Support form: ', form)
    this.isSupportFormSended = true
  }
}
const store = new FormsStore()
export default store
