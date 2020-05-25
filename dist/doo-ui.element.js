//import Doo from "/dist/js/doo.ui.js"
Doo.define(	class Ui extends Doo {
		
	constructor() {
			super()
			this.data = {}
		}
		async connectedCallback() {
            this.data[this.getAttribute('data-name')] = await this.getDataObj(this.getAttribute('data-fetch'))
			this.template = this.getAttribute('template')
			super.connectedCallback()
		}
	}
)