import Doo from  '../js/Doo.ui.min.js'
var uniqueId = (function() {
	var cnt = 0;
	return () => ++cnt
}());

export default class ToDoo extends Doo {
	
	constructor() {
		super(20000)
		this.template = this.getAttribute('template')
		this.data = {
			todoList: [], 
			dummy: [0],
			todoFilters : [
	 			{text:'All',	 	selected: 'selected', 	filter: undefined }, 
				{text:'Active',		selected: '',			filter: function(item) {return !item.completed}, selected:''},
				{text:'Completed',	selected: '',           filter: function(item) {return item.completed} ,  selected:''}
			] 
		}
		this.renderOnLoad = false
		this.fetchData()
	}

	static getRecCount(args) {
		return args.instance.data.todoList.length
	}

	static getS(args) {
		return args.instance.data.todoList.length>1 ? 's' : ''
	}

	toggleAll(elem) {
		let chk = !elem.previousElementSibling.checked
		this.data.todoList.forEach(todo => todo.completed = chk);
		this.render()
	}

	setDooClass() {
		let nodeList = this.shadow.querySelectorAll(['doo-class'])
		for (let i=0, len = nodeList.length; i<len; i++) {
			nodeList[0].classList.toggle(nodeList.getAttribute('doo-class'), this.data.todoList.length > 0 )
		}
	}

	addN(n) {
		for (let i = this.data.todoList.length-1 ; i<n; i++) {
			this.data.todoList.push({$_id: uniqueId(),type:1, todo: 'Todo '+ i, completed:false})
		}
		this.render()	
		if (this.data.todoList.length-1 > 0) { 
			this.shadow.querySelectorAll('LI')[Math.min(this.data.todoList.length-1, 99)].scrollIntoView(true)
		}
	}	

	async fetchData() {
		if (localStorage.getItem("todoList")) {
			this.data.todoList = JSON.parse(localStorage.getItem("todoList"))
		} else {
			const url = '/data/csv/todoList.csv'
			let res = await this.fetchURL(url)
			this.data.todoList = Doo.DB.csvToJson(res)
		}
		this.render()
		//this.style.visibility = 'visible'

	}
	removeCompleted() {
		this.data.todoList = this.data.todoList.filter( item => !item.completed)
		this.setFilter(0)
	}

	toggleCheck(elem, i) {
		this.data.todoList[i].completed = !this.data.todoList[i].completed
		elem.nextElementSibling.classList.toggle('true');
	}


	toggleComplete(i) {
		this.data.todoList[i].completed = !this.data.todoList[i].completed
		this.render()  
	}

	save() {
		localStorage.setItem("todoList", JSON.stringify(this.data.todoList));
	}

	removeTodo(id) {
		let idx = this.data.todoList.findIndex((item)=>item.$_id === id )
		this.data.todoList.splice(idx, 1)
		this.save()
		this.render()
	}

	addTodo(e) {
		if (e.keyCode === 13 ) {
			this.add(e.target)
		}
	}

	editTodo(elem, i) {
		this.beforeEdit = elem.innerHTML
		let editElem = document.createElement('input')
		editElem.className = 'edit'
		editElem .type = 'text'
		editElem.value = elem.innerHTML
		editElem.addEventListener('keyup', event =>this.cancelEdit(event, elem, i))
		editElem.addEventListener('blur', event =>this.cancelEdit(event, elem, i))
		let newElem = elem.parentElement.parentElement.appendChild(editElem)
		elem.parentElement.parentElement.classList.add('editing');
		newElem.focus()
	}

	cancelEdit(e, elem, i) {
		if (e.keyCode === 27 || e.keyCode === 13) {
			elem.innerHTML = e.keyCode === 27 ? this.beforeEdit : e.target.value
			elem.parentElement.parentElement.classList.remove('editing');
			e.target.parentElement.removeChild(e.target)
		} 
	}

	add(elem) {
		let todo = elem.value.trim();
		if (todo.length > 0) {
			let _id = this.data.todoList.length 
			this.data.todoList.push(
							{$_id:_id,
							type:1, 
							todo,
							completed:false
							});

			elem.value = "";
		}
		this.save()
		this.render()
	}
	setFilter(i) {
		if (this.curFilter && this.curFilter === i) return 
		this.data.todoFilters.forEach( item => item.selected = '')
		this.data.todoFilters[i].selected = 'selected';
		this.render('todoFilters')
		this.clearDataFilter('todoList')
		if (this.data.todoFilters[i].filter) {
			this.setDataFilter('todoList', this.data.todoFilters[i].filter )
		}	

		this.render('todoList')
		this.curFilter = i 
	}
/*
	s(item,i, dataSet) {
		return dataSet.length === 1 ? '' : 's'
	}
	
	size(item,i, dataSet) {
		console.log(dataSet.length)
		return dataSet.length
	}	
*/
}

Doo.define(ToDoo)
