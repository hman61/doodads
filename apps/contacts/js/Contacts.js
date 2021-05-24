Doo.define(
	class Contacts extends Doo {
		
		constructor() {
			super(50)
			this.scrollTarget = Doo.$Config.FLEX_BODY
			this.template =	this.getAttribute('template')
			this.defaultDataSet = 'contacts'
			Doo.DAO.append(this.defaultDataSet, new Mock(Doo.DAO.getData(this.defaultDataSet), 1000))
			this.filterTimeoutID = null
			this.data = {
				[this.defaultDataSet]: Doo.DAO.getData(this.defaultDataSet)
			}
		}

		add(elem) {
			this.lastPage = null
			let inputs = elem.querySelectorAll('input')
			let contact = {};
			[...inputs].forEach(item => { 
				this.setItemValue(contact, item.id, item.value)
			})
			contact.userId = this.data[this.defaultDataSet].length + 1
			Doo.DAO.append(this.defaultDataSet, [contact], 'top')
			this.data[this.defaultDataSet] = Doo.DAO.getData(this.defaultDataSet)
			this.refreshContainer()
		}

		addMore(cnt) {
			this.lastPage = null
			let data = new Mock(this.data[this.defaultDataSet], cnt).reverse()
			this.data[this.defaultDataSet].reverse()
			Doo.DAO.append(this.defaultDataSet, data, 'top')
			this.data[this.defaultDataSet] = Doo.DAO.getData(this.defaultDataSet)
			this.refreshContainer()
		}	

		async refreshContainer() {
			this.setScrollContainerHeight()
			this.setDataFilter(this.defaultDataSet) 	

			await this.render(this.defaultDataSet, 0)
			this.rendering = false
			if (this.container) {
				this.container.scrollTop = 0
			}
			this.clearChildren()
		}

	}
)
