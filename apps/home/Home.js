
//import Doo from  '/js/Doo.ui.js'
export default class Home extends Doo {
	constructor() {
		super()
		this.template = this.getAttribute('template')
		this.data = {}
		this.slideIndex = 1
	}

	async afterRender() {
		this.showDivs(this.slideIndex);
	}

	static getDesc(args) {
		return 'Phasellus eget enim eu lectus faucibus vestibulum. Suspendisse sodales pellentesque elementum.'
	}

	w3_open() {
		let x = this.shadow.getElementById("mySidebar");
		x.style.width = "300px"
		x.style.paddingTop = "10%"
		x.style.display = "block"
	}
		
	// Close side navigation
	w3_close() {
		this.shadow.getElementById("mySidebar").style.display = "none";
	}
		
	// Used to toggle the menu on smaller screens when clicking on the menu button
	openNav() {
		let x = this.shadowRoot.getElementById("navDemo");
		x.classList.toggle('w3-show')
	}	
	openModal(id) {
		this.shadow.getElementById(id).style.display='block'
	}	

	closeModal(id) {
		this.shadow.getElementById(id).style.display='none'
	}	

	plusDivs(n) {
		this.showDivs(this.slideIndex += n);
	}

	currentDiv(n) {
		this.showDivs(this.slideIndex = n);
	}

	showDivs(n) {
		let i
		let slides = this.shadow.querySelectorAll('.slides')
		let dots = this.shadow.querySelectorAll('.demodots')
		if (n > slides.length) {this.slideIndex = 1}    
		if (n < 1) {this.slideIndex = x.length}

		for (i = 0; i < slides.length; i++) {
			slides[i].classList.remove('show')
		}

		for (i = 0; i < dots.length; i++) {
			dots[i].classList.remove('w3-white')
		}

		slides[this.slideIndex-1].classList.add('show')  
		dots[this.slideIndex-1].classList.add('w3-white')
	}
}
Doo.define(Home)