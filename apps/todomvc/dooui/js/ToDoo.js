'use strict'
const uniqueId = (function() {
	var cnt = 0
	return () => ++cnt
}())
var SAVE_ID = null
var STORAGE_KEY = 'todo-dooui'
Doo.define(
	class ToDoo extends Doo {
	
		constructor() {
			super()
			this.template = this.getAttribute('template')
			this.data = {
				todos: [], 
				recCount: [0],
				todoFilters : [
					{text:'All',	 	filter: item => item}, 
					{text:'Active',		filter: item => !item.completed},
					{text:'Completed',	filter: item => item.completed}
				],
			}
			this.renderOnLoad = false	
		}
		async connectedCallback() {
			let context = this.getAttribute('context') || Doo.$Config.SHADOW 
			this.shadow = context === Doo.$Config.SHADOW ? this.attachShadow({mode: 'open'}) : document
	
			this.data.todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
			this.setFilterIndexBasedOnHash(false)
			window.addEventListener('hashchange', ()=>this.setFilterIndexBasedOnHash(true))
			this.isCypressTest = location.href.includes('127.0.0.1') 
			this.setFilter(this.selectedFilter)
			let x = await this.render()
			this.save()
			this.mainElem = this.shadow.querySelector('.main')
			this.footerElem = this.shadow.querySelectorAll('.footer')[0]
			this.toggleControls()
			if (this.isCypressTest)  {
				this.shadow.querySelector('.new-todo').focus()
			}
		}	

		refresh() {
			this.setFilter(this.selectedFilter)
			this.save()
			this.render()
			this.toggleControls()
		}

		setState() {
			if (this.isCypressTest) {
				this.refresh()
				return
			}
			if (SAVE_ID) {
				clearTimeout(SAVE_ID)
			}
			SAVE_ID = setTimeout(()=> {
				this.refresh()	
			},1)	
		}	

		toggleControls() {
			if (this.data.todos.length === 0) {
				this.mainElem.classList.add('hide')
				this.footerElem.classList.add('hide')
			} else {
				this.mainElem.classList.remove('hide')
				this.footerElem.classList.remove('hide')
			}
		}
		static getRecCount(args) {
			return args.instance.data.todos.length
		}

		static getCompleted(args) {
			return args.item.completed ? 'completed' : ''
		}

		static getS(args) {
			return args.instance.data.todos.length === 1 ? '' : 's'
		}

		static hide(args) {
			return args.instance.data.todos.filter(item => item.completed).length === 0 ? 'hide' : ''
		}

		allDone(elem) {
			let chk = elem.checked
			elem.value = !chk
			this.data.todos.forEach(todo => todo.completed = chk)
			this.setState()
		}

		removeCompleted() {
			this.data.todos = this.data.todos.filter( item => !item.completed)
			this.shadow.querySelector('#toggle-all').value = false
			this.setState()
		}

		toggleCheck(i) {
			this.data.todos[i].completed = !this.data.todos[i].completed
			this.shadow.querySelector('#toggle-all').checked = this.data.todos[i].completed
			this.setState()
		}

		save() {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data.todos));
		}

		removeTodo(id) {
			let idx = this.data.todos.findIndex(item=>item.id == id )
			this.data.todos.splice(idx, 1)
			this.setState()
		}

		addTodo(e) {
			if (e.keyCode === 13 ) {
				this.add(e.target)
			}	
		}

		editTodo(elem) {
			this.beforeEdit = elem.innerHTML
			elem.parentElement.nextElementSibling.value = this.beforeEdit
			elem.parentElement.parentElement.classList.add('editing')
			elem.parentElement.nextElementSibling.focus()
		}

		doneEdit(e, i, isBlur=false) {
			if (isBlur || e.keyCode === 27 || e.keyCode === 13) {
				let label = 	e.target.parentElement.querySelector('label')
				label.innerHTML = e.keyCode === 27 ? this.beforeEdit : e.target.value
				this.data.todos[i].title = e.keyCode === 27 ? this.beforeEdit : label.innerHTML
				label.parentElement.parentElement.classList.remove('editing')
				if (isBlur === false && e.keyCode !==27 && this.data.todos[i].title.trim().length === 0) {
					this.data.todos.splice(i, 1)
				}	
				this.setState()
			} 
		}

		add(elem) {
			let title = elem.value.trim();
			if (title.length > 0) {
				let next = uniqueId()
				this.data.todos.push({id:next, title, completed:false})
				elem.value = ''
			}
			this.setState()
		}

		renderFilter(i) {
			if (i !== this.selectedFilter) {
				this.setFilter(i)
				this.render()
			}
		}

		setFilterIndexBasedOnHash(refresh) {
			let i = 0
			if (location.hash) {
				let hash = location.hash.substring(1)
				let idx = this.data.todoFilters.findIndex((item) => item.text === hash )
				if (idx > -1) i = idx
			}
			this.selectedFilter = i
			if (refresh)  {
				this.setState()
			}
		}

		setFilter(i) {
			this.data.todoFilters.forEach( item => item.selected = '')
			this.data.todoFilters[i].selected = 'selected';
			this.clearDataFilter('todos')
			this.setDataFilter('todos', this.data.todoFilters[i].filter )
			this.selectedFilter = i 
		}
	}
)
