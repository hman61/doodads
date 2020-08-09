//import Doo from  '/js/doo.html.js'
export default class About extends Doo {
	constructor() {
		super()
		this.template = this.getAttribute('template')
		this.data = {
			'people': [
				{name:'Henrik Javen',
				title: 'Founder - https://doohtml.com',	
				avatar: 'h.jpg'},
				{name:'Doolio Doe',
				title: 'Lead Architect - https://doohtml.com',	
				avatar: 'dope1.png'},
			]	
					
		}
	}
}
Doo.define(About)