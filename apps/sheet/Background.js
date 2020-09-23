Doo.define(
	class Background extends Doo {
		constructor() {
			super()
			this.template = this.getAttribute('template')
			this.dataSheetKey = this.getAttribute('data-sheet-key')
			this.bind = this.getAttribute('bind')
			this.poll = this.getAttribute('data-poll')
			this.target = this.getAttribute('target')
			this.data = {}
			this.currentBackground = null
		}
		async dooAfterRender() {
			this.pollBackground()
			setInterval(()=>this.pollBackground(), this.poll)
		}
		async pollBackground() {
			this.data['background'] = await this.tableTop(this.dataSheetKey, this.bind)
			if (this.data['background'][0].url !== this.currentBackground) {
				let elem = document.querySelector(this.target )
				this.currentBackground = this.data['background'][0].url
				elem.style.backgroundImage = `url('${this.currentBackground}')`
			}
		}
	}
)