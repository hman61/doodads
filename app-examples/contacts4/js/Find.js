Doo.define(
	class Find extends Doo {
		
		constructor() {
			super(1)
			this.template =	this.getAttribute('template')
			this.target = this.getAttribute('target')
			this.target = this.getAttribute('target')
			this.data = {
				count: $Doo.instance[this.target]
			}
		}

		find(elem) {
			this.filterKey = elem.value
			this.setDataFilter(this.defaultDataSet) 	
			this.render()
		}

		async add(elem) {
			this.lastPage = null
			let inputs = elem.querySelectorAll('input')
			let contact = {};
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
