import { makeAutoObservable } from 'mobx'

class FormsStore {
  constructor() {
    makeAutoObservable(this)
  }

  isDawFormSended = false
  isSupportFormSended = false

  sendDawForm = (dawName) => {
    console.log('Daw form: ', dawName)
    this.isDawFormSended = true
  }

  sendSupportForm = (form) => {
    console.log('Support form: ', form)
    this.isSupportFormSended = true
  }
}
const store = new FormsStore()
export default store
