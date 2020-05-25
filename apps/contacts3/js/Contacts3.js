Doo.define(
	class Contacts3 extends Doo {
		
		constructor() {
			super(5)
			this.scrollTarget = Doo.$Config.FLEX_BODY
			this.template =	this.getAttribute('template')
			this.defaultDataSet = 'contacts'
			Doo.DAO.append(this.defaultDataSet, new Mock(Doo.DAO.getData(this.defaultDataSet), 10))
			this.data = {
				[this.defaultDataSet]: Doo.DAO.getData(this.defaultDataSet),
				dummy: ['coolio']
			}
		}

		static test(elem) {
			alert(elem.tagName)
		}

		find(elem) {
			this.filterKey = elem.value
			this.setDataFilter(this.defaultDataSet) 	
			this.render()
		}

		async add(elem) {
			this.lastPage = null
			let inputs = elem.querySelectorAll('input')
			let contact = new Mock([],1)[0];
			[...inputs].forEach(item => { 
				this.setItemValue(contact, item.id, item.value)
			})
			contact.userId = this.data[this.defaultDataSet].length + 1
			Doo.DAO.append(this.defaultDataSet, [contact], 'top')
			this.data[this.defaultDataSet] = Doo.DAO.getData(this.defaultDataSet)
			this.setScrollContainerHeight()
			this.render(this.defaultDataSet, 0)
			this.container.scrollTop = 0

		}

		addMore(cnt) {
			this.lastPage = null
			let data = new Mock(this.data[this.defaultDataSet], cnt).reverse()
			this.data[this.defaultDataSet].reverse()
			Doo.DAO.append(this.defaultDataSet, data, 'top')
			this.data[this.defaultDataSet] = Doo.DAO.getData(this.defaultDataSet)
			this.setScrollContainerHeight()
			this.render(this.defaultDataSet, 0)
			this.container.scrollTop = 0
			this.clearChildren()
		}	

	}
)
