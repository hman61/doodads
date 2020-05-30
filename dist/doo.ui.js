'use strict'
//TODO encapsulate
var $Doo = {
	instance: {},
	counter:{},
	getNextID: name => {
		if ($Doo.counter[name] === undefined) {
			$Doo.counter[name] = -1
		}	
		return  name + '_' + (++$Doo.counter[name]) 
	}
}
class Doo extends HTMLElement {
	static get version() {return 'v0.11.3'}
	constructor(pageSize=100) {
		super()
		Doo.debug = location.href.includes('#debug') || false
		this.debug = Doo.debug
		this.initialTime = (new Date().getTime())
		this.PAGE_SIZE = pageSize
		if (!this.template && this.getAttribute('template')) {
			this.template = this.template || this.getAttribute('template')
		}
		this.filteredData = {}
		this.visibleColumns = []
		this.place = []
		this.scrollPos = 0
		if (this.debug) { console.log(Doo.$Config.NAME + ' ' + Doo.version) }
	}

	getDooParent() {
		if (this.shadow.host) {
			let elem = this.shadow.host
			while (elem.parentNode) {
				if  (elem.parentNode.host) {
					return elem.parentNode.host
				}
				elem = elem.parentNode
			}
		}
		return null		
	}

	static get $Config() {
		return Object.freeze({
			TEMPLATE_EXT:'.html',
			COMPONENT_DIR: '/components',
			NAME:'Doo.ui',
			TYPE: {DEFAULT:0,ENUM:1,DEEP:2,COMPUTED:3 },
			MATCH: {ANY:-1,STARTS_WITH:0,EXACT:1},
			DELIMITER: {'BEG':'{{','END':'}}'},
			DOCUMENT: 'document',
			SHADOW: 'shadow',
			FLEX_BODY: '.fbody'
		})	
	} 

	static get $Computed() { 
		return {
			//TODO probably should change to class and use Reflection, or have these methods just live in Doo.DataItem
			//TODO figure out how todo chaining
			//use Reflect to test all computed
			//TODO change args to dataItem
			doo123:(args)=>{return args.instance.insertDoo123(args.name, args.props)},
			currentItem:(args)=>{ return args.item['address']},
			$0:(args)=>{return args.item[args.props[0]]},
			$1:(args)=>{return args.item[args.props[1]]},
			$2:(args)=>{return args.item[args.props[2]]},
			greyShade:(args)=>{return ['light-grey','grey','dark-grey','black'][args.i % 4]}, 
			randomTailwindShade:(args)=>{return 100 * Math.random((args.i % 8) + 1) }, 
			fraction:(args)=>['','whole','half','third','quarter','fifth'][args.arr.length], 
			toUpperCase:(args)=>args.getValue().toUpperCase(),
			toLowerCase:(args)=>args.getValue().toLowerCase(),
			substring:(args)=>{return args.getValue().substring(args.$1,args.$2)},
			length:(args)=>args.arr.length,
			found:(args)=>args.instance.getCurrentData(args.$1).length,
			count:(args)=>args.instance.data[args.$1].length,
			recCountByDataSetKey:(args)=>args.klass[args.dataSetKey].length,  //TODO not tested
			i:(args)=>args.i,
			row:(args)=>args.i+1,
			$id:(args)=>'_$' + args.i,
			n:(args)=>args.i+1,
			ts:()=> new Date().getTime(),
			pluralize:(args)=>args.arr.length > 1 ? 's' : '',
			nbsp:()=>'&nbsp;',
			zeroOne:(args)=>(args.i % 2),
			lorem:(args)=>{
				let lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' 
					if(!isNaN(args.$1)) {  
					let len = Math.min(args.$1, 6) 	
					for (let i = 1;i<len; i++) {
						lorem += ' Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
					}
					}  		
				return lorem
			}
		}
	}
	highlight(val) {
		let filterKey = this.filterKey && this.filterKey.toLowerCase()
		if (!filterKey || !val) {return val}
		let re = new RegExp(filterKey, "ig")
		let value = val.toString().replace(/&amp\;/gi,'&')
		//TODO make <b> configurable
		return value.replace(re, txt => `<b class="doo-find">${txt}</b>`)
	}



	//TODO remove obsolte
	static get observedAttributes() {
//		return ['doo-refresh','key','doo-foreach','orientation','doo-dao', 'data-src','implements','doo-db-update','doo-db','doo-theme', 'for-each','index','page-size','debug']
		return ['doo-refresh','key','doo-foreach','orientation','doo-dao', 'doo-db-update','doo-db','page-size','debug']
	
	}

	static xAttr() { return ['src', 'selected', 'checked',  'disabled', 'readonly'] } 

	// TODO this can probably be moved to Doo.$Computed
	static dynamic(item, i, arg) {
		return Doo.$Config.DELIMITER.BEG + item[arg] + Doo.$Config.DELIMITER.END
	}

	async attributeChangedCallback(name, oldVal, newVal) {
		//TODO do we need length???
		if (newVal.length > 0 && oldVal !== newVal) {
			if (name === 'doo-db-update' || name ==="doo-refresh") {
				await this.render()
			} else if (name === 'page-size') {
				this.PAGE_SIZE = newVal
			} else if (name === 'debug') {
				Doo.debug = true
			}	
		}	
	}
	
	
	static async insertComponent(component, target, path='.') {
		component = component.trim()
		let module = component.toLowerCase()

		let elem = document.createElement('div')
		
		elem.innerHTML = `<doo-${component} template="${path}/templates/${module}${Doo.$Config.TEMPLATE_EXT}?${Doo.$Computed.ts()}"></doo-${component}>`
		document.querySelector(`${target}`).innerHTML = elem.innerHTML
	}  

	//TODO add static debug flag and only log when in debug mode

	async connectedCallback() {
		let context = this.getAttribute('context') || Doo.$Config.SHADOW 
		this.shadow = context === Doo.$Config.SHADOW ? this.attachShadow({mode: 'open'}) : document
		if (!this.id && !this.getDooParent()) {
			this.id = $Doo.getNextID(this.constructor.name)
		}	
		if (!$Doo.instance[this.id]) { 
			$Doo.instance[this.id] = this
		} 

		if (typeof this.init === 'function') {
			await this.init()
		}
		
		if (this.debug) {
			let tag = this.constructor.name.toLowerCase()
			console.log(`Custom tag added: <doo-${tag} />`)
		}

		//TODO make builtin doo-datastore
		let repos = document.querySelectorAll('doo-datastore')
		let dataNodes
		for (let i=0, len = repos.length; i<len; i++) {
			dataNodes = repos[i].querySelectorAll('DATA')
			for (let j=0, len = dataNodes.length; j<len; j++) {
				let dataSet = await this.getDataObj(dataNodes[j].getAttribute('data-fetch'))
				let name = dataNodes[j].getAttribute('for-each')
				this.setAttribute('doo-dispatch', name)  

				Doo.DAO.setData(name, dataSet, this.constructor.name)
			}
			repos[i].innerHTML = ''
		}
		if (this.tagName === 'DOO-UI' && this.hasAttribute('data-fetch')) {
			let dataSet = await this.getDataObj(this.getAttribute('data-fetch'))

			let name = this.getAttribute('for-each')
			this.setAttribute('doo-dispatch', name)  

			Doo.DAO.setData(name, dataSet, this.constructor.name)
		}	

/*
		let dataNodes = this.querySelectorAll('DATA')
		if (dataNodes.length > 0) {
			for (let j=0, len = dataNodes.length; j<len; j++) {
				let dataSet = await this.getDataObj(dataNodes[j].getAttribute('data-src'))

				let name = dataNodes[j].getAttribute('data-ref')
				this.data[name] = dataSet
				if (j === 0) {
					this.defaultDataSet = name
					Doo.DAO.setData(this.defaultDataSet, this.data[name], this.constructor.name)
				}
			}
		}
*/
		await this.render() 

		if (this.scrollTarget) {
			this.scrollElem = this.shadow.firstElementChild.querySelector(this.scrollTarget)
		} 
		this.ready = true

		if (typeof this.afterRender === 'function') {
			 await this.afterRender()
		}
	}	

	static define(klass, alias=null) {
		let name = alias || klass.name.toLowerCase()
		customElements.define('doo-' + name, klass)
	}	

	getFilteredData(name) {
		return this.filteredData[name]
	}

	//TODO make sure it works with this.getItemValue() and move to computed
        
	// TODO maybe call in base constructor ???
	// suport multiple db names "abc, xyz" => [
    /*
    setDooDB(name=null) {
		const dbName = name ? name : this.getAttribute('doo-db')
		if (dbName) {
			this.classList.add("doo-db::" + dbName)
		}
	}
     */
    //TODO I think we can use documentOrShadowRoot see MDN
/*
	getNode(selector, docOrShadow=this.shadow) {
    	return docOrShadow.querySelectorAll(selector)[0]
    } 
*/
	async setTemplate(argTpl, doc) {
    	let tpl = (argTpl.indexOf('<template') === 0) ? argTpl : '' 
		if (this.firstElementChild && this.firstElementChild.getElementsByTagName('template').length > 0)   {
    		tpl = this.firstElementChild.getElementsByTagName('template')[0].outerHTML
    	} else {
    		tpl = await this.getTemplateURI(argTpl, doc) 
		}
		return tpl

	}

	async getTemplateURI(url) {
		let tpl
		if (url.indexOf('#') === 0) {
			tpl = await document.querySelector(url).outerHTML
		} else {
			//TODO remove script tags
			tpl = await Doo.fetchURL(url)
		}
		return tpl
	}
    
	dooParse(argDataNode, fldLookup) {
		//TODO remove HTML comments
		//TODO replace {{}} in <code></code> and <pre></pre> with escaped "\{\{" 
		//TODO Allow for nested {{xxx{{yyy}}zzz}}
		let tplNode = argDataNode.cloneNode(true)
		tplNode.removeAttribute('for-each')
		tplNode.removeAttribute('dynamic')
		let htmlStr = tplNode.outerHTML.replace(/\t/g, '').replace(/\n/g, '')
		let orgStr = htmlStr
		//covers checked="false" where browser returns true 
		//TODO: check modern browser to see if it still is an issue
		Doo.xAttr().forEach(item => {
			htmlStr = htmlStr.replace(new RegExp(' ' + item + '="\{\{(.+)}}"', 'g'), ' doo-' + item + '="{{$1}}"')
		})

		let xHtml = (orgStr === htmlStr)
		if (window[this.constructor.name] === undefined) {
            window[this.constructor.name] = []
		} 
		//TODO bind(this)
		let inst =  window[this.constructor.name].length
		htmlStr = htmlStr.split('="self.').join('="' + this.constructor.name + '[' + inst + '].');
		//TODO allow key with no value
		// if (this.getAttribute('key')) {
		// 	htmlStr = htmlStr.split(' key ').join(' key="{{ i() }}" ');
		// }	
		let aHTML = htmlStr.split(Doo.$Config.DELIMITER.END)

		let templateArray = []
		let len = aHTML.length
		let aStr
	



		for (let i=0; i<len; i++) {
			if (Doo.$Config.DELIMITER.BEG.includes(Doo.$Config.DELIMITER.BEG)) {
				aStr = aHTML[i].split(Doo.$Config.DELIMITER.BEG)
				templateArray.push(aStr[0])	
				templateArray.push(this.getPropertyType(aStr[1], fldLookup))		
			}	
		} 
		return {templateArray:templateArray,xHtml:xHtml}
	}

	getPropertyType(fld, fldLookup) {
		if (!fld) {
			return new Doo.FieldType('', undefined, this.constructor, this)
		}	
		fld = fld.trim()

		// if (fldLookup && fld.indexOf('$') === 0) {
		// 	fld = fldLookup[fld]
		// }

		let type = Doo.$Config.TYPE.DEFAULT
		if (fld.indexOf('(') > -1) {
			type = Doo.$Config.TYPE.COMPUTED 
 		} else { 
			if (fld.indexOf(".") > 0) {
				type = Doo.$Config.TYPE.DEEP
			} else if (!isNaN(fld)) {
				type = Doo.$Config.TYPE.ENUM
			}
		}
	
		let fieldType = new Doo.FieldType(fld, type, this.constructor, this)

        //TODO this needs to be sco0ped	
		this.visibleColumns.push(fld) 
		fieldType.parentElem = this.parentElement
 		return fieldType
	}
	setItemValue(obj, prop, value ) {
			let aProp = prop.split('.');
			for (var j=0;j<aProp.length-1;j++) {
				obj = obj[aProp[j]] = {}
			}
			obj[aProp[aProp.length-1]] = value
	} 	

	getItemValue(item, prop) {
		if (typeof prop === 'function') {
			return this.highlight(this[prop](item))
		}
		let curValue = item
		try { 
			prop.split('.').forEach(key => curValue = curValue[key])
		} catch(e) {
			console.log('Property not found', prop, JSON.stringify(curValue))
		}
	
		return this.highlight(curValue)
	}

	// TODO combind first 2 parmeters
	renderNode(templateArray, xHtml, data, start = 0, pgSize = this.PAGE_SIZE) {
		data = Array.isArray(data) ? data : [data]
		let dataLen = data.length
		let stop = start + pgSize
		if (stop > dataLen) { stop = dataLen }
	
		let html = []
		for (let i = start; i<stop; i++) {
			for (let j=0, len = templateArray.length; j<len; j=j+2) {
				html.push(templateArray[j])

				let templateFldObj = templateArray[j+1]
				switch (templateFldObj.type) {
					case (Doo.$Config.TYPE.DEFAULT): 
					case (Doo.$Config.TYPE.DEEP):
   					    html.push(this.getItemValue(data[i],templateFldObj.fld))
						break
					case (Doo.$Config.TYPE.ENUM):
						if (this.filterKey) {
							html.push(data[i])
						} else {
							html.push(this.highlight(data[i]))
						}
						break
					case (Doo.$Config.TYPE.COMPUTED):
						// TODO should probably be static for speed
						let dataItem = new Doo.DataItem(data[i], i, data)
						//dataItem.dataSetName = dataElem.dataKey   //TODO TEST
						dataItem.fld = templateFldObj.fld
						dataItem.func = templateFldObj.func
						dataItem.$1 = templateFldObj.$1
						dataItem.$2 = templateFldObj.$2
						dataItem.$3 = templateFldObj.$3
						dataItem.$4 = templateFldObj.$4
						dataItem.$5 = templateFldObj.$5

						dataItem.instance = templateFldObj.instance
						html.push(templateFldObj.func(dataItem))
						//dataItem = undefined  //TODO check to see if this gets released right away, or do we need to set it to undefined  
                        break
					case (undefined):
						html.push('')
				}
			}
		}
		if (xHtml) {
			return html.join('')
		} else {	
			let htmlStr = html.join('')
			Doo.xAttr().forEach(item => {
				if (item === 'checked' || item ==='disabled') {
					htmlStr = htmlStr.replace(new RegExp(' doo-' + item + '="false"', 'g'), ' ')
							.replace(new RegExp(' doo-' + item + '="0"', 'g'), ' ')
				}
				htmlStr = htmlStr.replace(new RegExp(' doo-' + item + '=', 'g'), ' '+ item + '=').replace(new RegExp(' ' + item + '=""', 'g'), ' ');

			})
			return htmlStr
		}
	}
	
	getLevel(dataSetElem) {
		let level = 0
		let dynamic = dataSetElem.getAttribute('dynamic')
		while (dataSetElem.parentElement) {
			dataSetElem = dataSetElem.parentElement
			level++
		}
		return level;
	}

	//TODO
	clearDataFilter(dataSetName) {
		this.filteredData[dataSetName] = undefined
	}

    //TODO make filter criteria object
	//TODO make static filter RecCount and Total RecCount
	//setDataSearchFilter(dataSetName, matchType = Doo.$Config.MATCH.ANY) {
	//}	
	setDataFilter(dataSetName, criteria) {
    	 
        let filterKey = this.filterKey && this.filterKey.toLowerCase()
		//TODO let data = [...this.data[dataSetName]] insted of slice
		let data               = this.data[dataSetName].slice()
		let me = this
		if (criteria) {
			data = data.filter(criteria)
		} else if (filterKey) {
			filterKey =String(filterKey)
			//TODO set filter only and filter the data during renderNode method
			data = data.filter(row => me.visibleColumns.some(key => String(me.getItemValue(row, key)).toLowerCase().indexOf(filterKey)>-1))
		}	
		this.filteredData[dataSetName]  = data.slice(0, this.page_size)
	}
	//TODO make promise and 

	async getDataObj(dataSrc, elem) {
		dataSrc = dataSrc.trim()
		let data, key
		if (dataSrc.indexOf('http') === 0 || dataSrc.indexOf('.json') > 0) {	  
				data = await Doo.fetchURL(dataSrc)
				return JSON.parse(data)
		} else if (dataSrc.indexOf('.js') > 0) {  
			    // TODO make fetch, dynamic imports are not allowed in es2019 	
				data = await import(`${dataSrc}`)
				return data.default
		} else if (dataSrc.indexOf('{') === 0) {							
				return JSON.parse(dataSrc)
		} else if (dataSrc.indexOf('..') === 0 || dataSrc==='this.parent') {
			let parentDoo = this.getDooParent() 
			return parentDoo.data
		//TODO move to computed do a common .. splitter that returns a range object
		} else if (dataSrc.indexOf('..') > 0) { 
				let dataRange = dataSrc.replace('[','').replace(']','')
				let range = dataRange.split('..')
				let arr = []
				let isAlpha = isNaN(range[0])
				let start = parseInt(isAlpha ? range[0].charCodeAt(0) : range[0])
				let stop = parseInt(isAlpha ? range[1].charCodeAt(0) : range[1])
				for (let j=start; j<=stop; j++) {
					arr.push(isAlpha ? String.fromCharCode(j) : j )
				}
				return arr.splice(0)
		} else if (dataSrc.indexOf('[') === 0) {  
				let dataKeyValues = dataSrc.replace('[','').replace(']','').split(',')
				dataKeyValues.forEach(item=>item.trim())
				return dataKeyValues
		} else if (dataSrc.indexOf('window.') === 0 || dataSrc.indexOf('const.') === 0 || dataSrc.indexOf('var.') === 0) { 
				key = dataSrc.split('.')[1].trim() 
				return window[key]
		} else if (dataSrc.indexOf('this.') === 0) {
			key = dataSrc.split('.')[1]
			return this[key]
		} else  { 
			console.log('WARNING' + dataSrc + ' datasource not scooped properly')	
		}
		return dataSrc
	}	

	async initDataNodes(tplNode) {
		let fldLookup
		if (this.hasAttribute('data-map')) {
			fldLookup = this.getAttribute('data-map').split('|')
		}


		const replacer = (match, p1, offset, string) => {

			if (isNaN(p1)) {
				return this.hasAttribute(p1) ? this.getAttribute(p1) : 
						tplNode.hasAttribute(p1) ? tplNode.getAttribute(p1) : '';
			} else if (fldLookup.length > 0) {
				return Doo.$Config.DELIMITER.BEG + fldLookup[p1-1] + Doo.$Config.DELIMITER.END 
			}	
		}
		let content = tplNode.innerHTML
		content = content.replace(/\$\{(.+?)\}/gm, replacer);
		tplNode.innerHTML = content

		let reactiveElems = tplNode.content.querySelectorAll('[data-src]')
		let len = reactiveElems.length
		let i = 0
		let reactiveElem = [], dataElem, dataSet
		for (i=0;i<len;i++) {
			let key = reactiveElems[i].getAttribute('for-each').trim()  
			let dataSrc = reactiveElems[i].getAttribute('data-src').trim()
			if (dataSrc) {
				if (dataSrc === 'Doo.DAO') {
					dataSet = Doo.DAO.getData(key)
				} else {
					dataSet = await this.getDataObj(dataSrc, reactiveElems[i] )
				}
				this.data[key] = Array.isArray(dataSet) ? dataSet : dataSet[key]
			} 
			if (dataSrc.indexOf('this.parent') === 0) {
				reactiveElems[i].useParent = true
			}

			reactiveElems[i].removeAttribute('data-src')
			reactiveElems[i].level = this.getLevel(reactiveElems[i])
			reactiveElem.push(reactiveElems[i])
		}

		const orderByLevel = (a,b) => {
			return ((a.level === b.level) ? 0 : (a.level > b.level) ? 1 : -1)
		}

		reactiveElem.sort(orderByLevel).reverse()

		for (i=0;i<len;i++) {
			let isDynamic = reactiveElem[i].getAttribute('dynamic')  //TODO doo-dynamic

			if ('|STYLE|LINK|'.indexOf(`|${reactiveElem[i].tagName}|`) >-1) {
				dataElem = reactiveElem[i]
			} else if (reactiveElems[i].getAttribute('for-each') === 'xdummy' || reactiveElem[i].parentElement && '|UL|TBODY|THEAD|TFOOT|TR|SELECT|'.indexOf(`|${reactiveElem[i].parentElement.tagName}|`) >-1) {
				//TODO remove slots or elem with doo-static attribute, and put as first child after render 
				dataElem = reactiveElem[i].parentElement
			} else {
				dataElem = document.createElement('data')	
			}
			dataElem.dataKey = reactiveElem[i].getAttribute('for-each')
			let parsedNode = this.dooParse(reactiveElem[i], fldLookup)

			dataElem.templateArray = parsedNode.templateArray 	
			dataElem.xHtml = parsedNode.xHtml 	
			dataElem.name = i
			dataElem.level = this.getLevel(reactiveElem[i])
			dataElem.useParent = reactiveElem[i].useParent
			dataElem.noRepeat = reactiveElem[i].hasAttribute('data-norepeat')
		
			if (isDynamic) {dataElem.isDynamic = true}

			if (dataElem.tagName === 'DATA' || dataElem.tagName === 'STYLE' || dataElem.tagName === 'LINK') {
				//TODO allow for templates not to require single root node 
				if (reactiveElem[i].parentElement) {
					reactiveElem[i].parentElement.replaceChild(dataElem, reactiveElem[i])
				} else {
					//TODO consider adding single child node on the fly
					console.log('Warning: Templates should only have one childnode')
					reactiveElem[i].appendChild(dataElem)					
				}	
			}

			this.place.push(dataElem)
		}
		return this.place
	}

	async prepareTemplate(dataSetName=null) { 
		if (this.debug) console.log('Template:', this.template)
		let tpl = await this.setTemplate(this.template)
		let elem = document.createElement('div')
		elem.innerHTML = tpl
		if (elem.querySelector('template')) {
			//TODO create ERROR slot or Doo.$Config constance
			elem.innerHTML = elem.querySelector('template') ? tpl : `<template><center><pre>The template you are trying to import does not have a &lt;template&gt tag</pre><div style="color:red">${argTpl}</div></enter></template>`
		}
		//TODO check for null pointer
		let importedTemplate = elem.querySelector('template').cloneNode(true)
		importedTemplate.removeAttribute('id')

		this.templateNode  = document.createElement('template')
		// TODO probably not used
		let dataDispatch = this.getAttribute('data-dispatch') || 'undefined'
		this.templateNode.innerHTML = importedTemplate.innerHTML.replace(/\${dataDispatch\}/g,dataDispatch)

		// TODO warn when there are multiple children (maybe not needed, not sure)
		/*	if (!this.templateNode.content.parentElement) {
				let tplRootNode = document.createElement('section');
				tplRootNode.innerHTML = this.templateNode.innerHTML
				this.templateNode.innerHTML = tplRootNode.outerHTML
			}
		*/
		//TODO implement css="inherit" and use https://developer.mozilla.org/en-US/docs/Web/API/DocumentOrShadowRoot to bring them in
		
		if (!this.shadow && this.getAttribute('css')) {
			let cssList = this.getAttribute('css').split(',')
			let len = cssList.length 
			for (let i=0;i<len;i++) {
				let link = document.createElement('link')
				link.href = cssList[i]
				link.rel = "stylesheet"
				//this.templateNode.content.firstElementChild.parentNode.insertBefore(link, this.templateNode.content.firstElementChild)
				this.templateNode.content.firstElementChild.parentNode.insertBefore(link, this.templateNode.content.firstElementChild)
			}
		}
		this.templateElem = this.templateNode.content

		let styleNode = 	this.templateElem.querySelectorAll('style')
		//TODO support multiple style nodes within the template
		if (styleNode && styleNode.length > 0) {
			this.templateElem.appendChild(styleNode[0])
		}
		if (this.place.length === 0) {
			await this.initDataNodes(this.templateNode)
			if (this.getAttribute('style')) {
				this.templateNode.setAttribute('style', this.getAttribute('style'))
			}
		} 
	}
	
	async setContext() {
		
		//TODO tie this to the Doo object and bind it more elegantly
		if (!window[this.constructor.name]) {
			window[this.constructor.name] = []
		}
		window[this.constructor.name].push(this)
		if (this.childNodes.length >0) {
			if (this.getElementsByTagName('template') && this.getElementsByTagName('template').length > 0) {
				this.removeChild(this.getElementsByTagName('template').item(0))
			}	
		}	
		let context = this.getAttribute('context') || Doo.$Config.SHADOW 
		if (context === Doo.$Config.SHADOW) {
			this.shadow.host.style.visibility = 'hidden'
			let currentClasses = this.templateElem.firstElementChild.hasAttribute('class') ? ' ' + this.templateElem.firstElementChild.getAttribute('class') : ''
			let parentClasses = this.getAttribute('class')
			this.templateElem.firstElementChild.setAttribute('class', `${parentClasses}${currentClasses}`)
			this.shadow.appendChild(this.templateElem)
			this.componentContainer = this.shadow.host 
		} else if (context === Doo.$Config.DOCUMENT) {
			this.style.visibility = 'hidden'
			let elem = this.parentElement.replaceChild(this.templateElem, this)
			this.componentContainer = elem 
		}	
		//TODO look for a class rule instead	
		let delay = navigator.userAgent.toUpperCase().includes('FIREFOX') ? 50 : 10

		if (this.scrollTarget) {
			this.setAttribute('doo-id', this.id)
			let loadCnt = 0
			let heightCheck = setInterval(() => {
				loadCnt++ 
				if (loadCnt > 50 || (this.scrollElem && this.getStyle(this.scrollElem.firstElementChild.firstElementChild, 'display') === 'flex')) {
					clearInterval(heightCheck)
					this.setScrollHeight()
					this.componentContainer.style.visibility = 'visible'	
				}
			}		
			, delay);
		} else {
			setTimeout(()=>{this.componentContainer.style.visibility = 'visible'}, delay)	
//			this.componentContainer.style.visibility = 'visible'	

		}
		this.ready = true
	}		

	async setScrollHeight() {	
		if (this.scrollTarget) {
			this.scrollElem = this.shadow.firstElementChild.querySelector(this.scrollTarget)
			if (this.data[this.defaultDataSet].length > this.PAGE_SIZE) {
				this.addScrollWatcher()
			}	
		}			
	}
	getCurrentData(name) {
		return this.getFilteredData(name) ? this.getFilteredData(name) : this.data[name]
	
	}	

	async render(dataSetName=null, page=0, replaceOrAppendRow=null) {
		if (!this.template) {
			console.log(this.name + ' has no template defined')
			return
		} 
		if (!this.templateNode && !this.ready) {
			await this.prepareTemplate(dataSetName)
		}	
		let startTime = this.debug ? new Date().getTime() : null
		for (let i=0, len=this.place.length;i<len;i++) {
			if (dataSetName && dataSetName !== this.place[i].dataKey) {
				continue   // TODO other for-eachs that are children of the specified data set proably needs to be re-rendered (needs test scenarios)
			}
			if (page === 0 && this.place[i].tagName !== 'STYLE') {
				let pg = this.place[i].getAttribute('for-each') === 'dummy' ? -1 : 0 
				this.place[i].setAttribute("page", pg);
			}	
			if (this.place[i].isDynamic) {continue}
			let data = this.getCurrentData(this.place[i].dataKey) 
			this.getFilteredData(this.place[i].dataKey) ? this.getFilteredData(this.place[i].dataKey) : this.data[this.place[i].dataKey]
			let pageSize = this.place[i].noRepeat ? 1 : this.PAGE_SIZE
			if (replaceOrAppendRow === null) {
				// TODO combined first 2 parameter as a parsedTemplateArrayObject
				if (page > 0 && dataSetName === this.defaultDataSet) {
					let pagePointer = this.scrollElem.querySelector('data[page="' + page + '"]')
					if (!pagePointer) {
						let newElem = document.createElement('data')
						newElem.setAttribute("page", page);
						newElem.innerHTML = this.renderNode(this.place[i].templateArray,this.place[i].templateArray.xHtml, data,   page * this.PAGE_SIZE, pageSize)
						if (!this.lastInsertedElem || page > this.lastPage) { 
							this.place[i].parentElement.appendChild(newElem)
						} else {
							this.lastInsertedElem.insertAdjacentElement('beforebegin', newElem)
						}
						this.lastInsertedElem = newElem
					} else {
						if (pagePointer.innerHTML.length === 0) {
							pagePointer.innerHTML =  this.renderNode(this.place[i].templateArray, this.place[i].templateArray.xHtml, data,  page * this.PAGE_SIZE, pageSize)
						}	
						this.lastInsertedElem = pagePointer
					}
					this.lastInsertedElem.style.top = (page * this.blockHeight) + 'px'
					this.lastInsertedElem.style.position = 'absolute'
				} else {
					if (this.place[i].useParent) {
						this.place[i].innerHTML =  this.renderNode(this.place[i].templateArray, this.place[i].templateArray.xHtml, data, parseInt(this.getAttribute('key')) , 1)
					} else {	
						this.place[i].innerHTML =  this.renderNode(this.place[i].templateArray, this.place[i].templateArray.xHtml, data,  page * this.PAGE_SIZE, pageSize)
					}	
				}	
			} else {
				this.place[i].append(this.renderNode(this.place[i].templateArray,this.place[i].templateArray.xHtml, data,  replaceOrAppendRow, 1))
			}
			if (dataSetName === this.defaultDataSet) {
				this.lastPage = page
			}	
		}		
		//TODO rename 
		if (!this.ready) {
			this.setContext()
		}
		if (this.debug && !this.getAttribute('title')) {
			this.setAttribute('title', this.id + ':init() ' + (new Date().getTime() - this.initialTime) + 'ms')
		}
		if (this.debug) {
			let renderTime = (new Date().getTime() - startTime) + 'ms'
			this.setAttribute('doo-render-time', renderTime)
			this.setAttribute('title', this.getAttribute('title') + '|' + renderTime)
		}
		return page	
	}
	
	//TODO rename
	static async fetchURL(url) {
		return new Promise((resolve, reject) => {
		  const xhr = new XMLHttpRequest()
		  xhr.open("GET", url)
		  xhr.onload = () => resolve(xhr.responseText)
		  xhr.onerror = () => reject(xhr.statusText)
		  xhr.send();
		})
	}
	//TODO deprecated
	setHttpRequest(url, callback) {
		let me = this
		let xhr = new XMLHttpRequest();
		xhr.onload = function () { 
			callback(this.responseText, me) 
		}
		xhr.open('GET', url, true)
		xhr.send()
	}
	
	hasScroll(elem) {
		//TODO set paging
		return (this.getStyle(elem, 'overflow-y') === 'auto' || this.getStyle(elem, 'overflow-y') === 'scroll');
	}	
	getStyle(argElem, cssProperty, psudo = null) {
		return (argElem.currentStyle) ? argElem.currentStyle[cssProperty] : window.getComputedStyle(argElem, psudo).getPropertyValue(cssProperty); 
	}
		
	async sortBy(elem, name) {
		this.lastPage = null
		let dir = elem.getAttribute('sort-dir') || 1
		Doo.util.sortBy(this.getCurrentData(this.defaultDataSet), name, dir)
		let sortFields = elem.parentElement.querySelectorAll('.doo-sort');
		[...sortFields].forEach(item => { 
			item.classList.remove('dir_1','dir_-1')
		})	
		elem.classList.add((parseInt(dir)*-1 === 1) ? 'dir_-1':'dir_1')
		elem.setAttribute('sort-dir', dir*-1)
		let pg
		if (this.scrollElem) {
			pg = this.scrollElem.querySelectorAll('[page]')
			if (pg) { pg[0].innerHTML = ''}
		}	
		this.lastInsertedElem = null
		this.rendering = true
		await this.render(this.defaultDataSet, 0)
		this.rendering = false
		if (this.container) {
			this.container.scrollTop = 0
		}
		// TODO call clear
		if (pg && pg.length > 0) {
			for (let k=pg.length-1;k>0;k--) {
				pg[k].remove()
			}	
		}
		// TODO scroll top
	}
	clearChildren(dontRemove) {
		let pages = this.scrollElem.querySelectorAll('[page]')		
		for (let k=pages.length-1;k>0;k--) {
			if (dontRemove && dontRemove.find(val => val === parseInt(pages[k].getAttribute("page")))) {
				continue
			}
			pages[k].remove()
		}	
	}

	async setScrollContainerHeight() {
		this.scrollElem.style.height =  (this.rowHeight * (this.data[this.defaultDataSet].length-1)) + 'px' 
	}	
	async windowWatcher() {
		document.body.setAttribute('doo-height', window.offsetHeight)
	}	

	async addScrollWatcher() {
		if (this.scrollTarget) {


			this.scrollElem = this.shadow.firstElementChild.querySelector(this.scrollTarget)

			// TODO add mutation watcher to container height
			if (this.scrollElem && this.data[this.defaultDataSet].length > this.PAGE_SIZE) {
				this.scrollElem.style.position = 'relative'
				this.container = this.scrollElem.parentElement
				this.rowHeight = this.scrollElem.offsetHeight/this.PAGE_SIZE

				this.setScrollContainerHeight()
				this.blockHeight = this.PAGE_SIZE * this.rowHeight
				let isSmaller = false 
				while (this.blockHeight < this.container.offsetHeight) { 
					this.PAGE_SIZE = this.PAGE_SIZE * 2
					this.blockHeight = this.PAGE_SIZE * this.rowHeight
					isSmaller = true
				}
				if (isSmaller) {
					await this.render(this.defaultDataSet, this.lastPage || 0)
				}
				this.lastScrollPos = 0

				this.container.addEventListener('scroll', this.scrollWatcher.bind(this))
			}	
		}
	}	

	async scrollWatcher() {
		if (!this.rendering) {
			this.rendering = true
			let y = parseInt(this.container.scrollTop/this.blockHeight) 
			let next = parseInt((y*this.blockHeight + this.blockHeight)/this.blockHeight) 
			let dir = this.container.scrollTop > this.lastScrollPos ? 1 : 0
			let page = this.scrollElem.querySelector('data[page="' + y + '"]')
			let nextPage = this.scrollElem.querySelector('data[page="' + next + '"]')
			if (!page || next > y) {			
				if (!nextPage) {
					this.render(this.defaultDataSet, next)
				}
				this.currentPage =  this.render(this.defaultDataSet, y)
			} else if (y != this.currentPage) {
				this.currentPage = this.render(this.defaultDataSet, y)
			}	
			let dontRemove = dir === 1 ? [y-1,y,next] : [y,y+1]
			this.clearChildren(dontRemove)
			this.lastScrollPos = this.container.scrollTop
			this.rendering = false
		}
	}
}


//TODO convert to class with static getters and setters(maybe) 
Doo.DAO = {
			
		'dataSet':{},
		'setData': 
		function(name, dataSet, instanceName = null) {
			this.dataSet[name] = dataSet
			if (Doo.debug && instanceName) {
				if (!localStorage.getItem('Doo')) {
					let Doo = {}
					localStorage.setItem('Doo',JSON.stringify(Doo))	
				}
				const ls = JSON.parse(localStorage.getItem('Doo')) 
				ls[instanceName+'_'+name] =  this.dataSet[name]	

				localStorage.setItem('Doo', JSON.stringify(ls))
			}
			//this.refresh(name)

		},
		'getData':
		function(name)  {	
			if (!this.dataSet[name]) {
				this.dataSet[name] = []
			}
			return this.dataSet[name]
		},	
		'prepend':
		function(name, obj) {	
			this.append(name, obj, true)
		},	
		
		'append':
		async function(name, obj, top = null) {
			//TODO this can all be done with splice
			if (Array.isArray(obj)) {
				this.dataSet[name] = top ? obj.concat(Doo.DAO.getData(name)) : Doo.DAO.getData(name).concat(obj) 
			} else { 
				if (!this.dataSet[name]) {
					this.dataSet[name] = []
				}
				if (top) {
					Doo.DAO.getData(name).splice(0, 0, obj) 
				} else {
					Doo.DAO.getData(name).push(obj)
				} 	
			}
			this.refresh(name)
		},
		'update':
		function(name, obj, idx) {
			Doo.DAO.getData(name).splice(idx,1,obj)
			this.refresh(name)
		},
		'remove': 
		function(name, idx) {
			Doo.DAO.getData(name).splice(idx,1)
			this.refresh(name)
		},
		'refresh':
		async function(name, doc = document) {
			const subscriber = doc.querySelectorAll("[doo-dispatch='" + name +"']")
			for (let i=0, len=subscriber.length; i<len; i++) {
				await subscriber.item(i).render()
			}
		},
		'csvToJson':
		function(csvText) {
	    	let rows = csvText.split("\n")
	    	let data = []
			if (rows !== undefined) {
				let rowsLen = rows.length
				let fieldDesc = rows[0].replace(/\r/g, '')
				let cols = fieldDesc.split(",")
				let colLen = cols.length

				if (rows.length > 1) {
					let re = new RegExp('(,)(?=(?:[^"]|"[^"]*")*$)','g')
					for (let i=1;i<rowsLen-1;i++) {
						let obj={}
						let rowStr = rows[i].replace(re, '|^|') + '|^|'	
						let row = rowStr.split('|^|')
						for (let j=0;j<colLen;j++) {
							obj[cols[j]] = (row[j]) ? row[j].replace(/"/g, '').trim() : ''
						}	
						data.push(obj)
					}	
				}
			}
			return data
		}
}
Doo.util = {
	'getStyle': (argElem, cssProperty, psudo = null) => {
		return (argElem.currentStyle) ? argElem.currentStyle[cssProperty] : window.getComputedStyle(argElem, psudo).getPropertyValue(cssProperty); 
	},
	'sortBy':(data, argSortArray, argDirection) => {
		if (data.length < 1) { 
			return;	
		}

		const comparator = {

			'getValue':
			(item, prop ) => {
				var aProp = prop.split('.');
				var curValue = item;
				for (var j=0;j<aProp.length;j++) {
					curValue = curValue[aProp[j]];
				}
				return curValue;
			},  

			'getDataType':
			function(argFld, argArray) {
				if (typeof argFld === 'object') { return 'byFunc'; }
				
				var val = comparator.getValue(argArray[0],argFld);
		
				if (val && val.toString().indexOf("/") > 0 && new Date(val) && !isNaN(new Date(val).getTime())) {return 'byDate'; }
				for (var i=0; i<argArray.length; i++) {
					if (isNaN(comparator.getValue(argArray[i],argFld))) {
						return 'byString';  
					}
				}
				return 'byNumber';
			},

			'byFunc':
			function(a, b, obj, i) {
				var fn = obj[i].cmd;
				var fa = fn.call(this, (obj[i].dir === -1 ? b : a), obj[i].param, argDirection );
				var fb = fn.call(this, (obj[i].dir === -1 ? a : b), obj[i].param, argDirection );
				if  (fa < fb) {return -1;}
				if  (fa > fb) {return 1;}
				return (typeof obj[i+1] != 'undefined') ? comparator[obj[i+1].type](a,b, obj, i+1) : (a.$_id - b.$_id);
			},       

			'byDate':
			function(a, b, obj, i) {
				var fld = obj[i].fld.replace(Doo.$Config.DELIMITER.BEG,'').replace(Doo.$Config.DELIMITER.END,'')
				var da = comparator.getValue((obj[i].dir === -1 ? b : a),fld);
				var db = comparator.getValue((obj[i].dir === -1 ? a : b),fld);
				if (!da.getTime && !db.getTime) {
					da = new Date(da);
					db = new Date(db);
				}
				da = da.getTime();
				db = db.getTime();
				if  (da < db) {return -1;}
				if  (da > db) {return 1;}                   
				return (typeof obj[i+1] != 'undefined') ? comparator[obj[i+1].type](a,b, obj, i+1) : (a.$_id - b.$_id);
				},

			'byString':
			function(a, b, obj, i) {
				var fld = obj[i].fld.replace(Doo.$Config.DELIMITER.BEG,'').replace(Doo.$Config.DELIMITER.END,'')
				var sa = comparator.getValue(obj[i].dir === -1 ? b : a, fld).toUpperCase()
				var sb = comparator.getValue(obj[i].dir === -1 ? a : b, fld).toUpperCase()
				if  (sa < sb) {return -1;}
				if  (sa > sb) {return 1;}
				return (typeof obj[i+1] != 'undefined') ? comparator[obj[i+1].type](a,b, obj, i+1) : (a.$_id - b.$_id);

			},

			'byNumber':
			function(a, b, obj, i) {
				var fld = obj[i].fld.replace(Doo.$Config.DELIMITER.BEG,'').replace(Doo.$Config.DELIMITER.END,'')
				var na = Number(comparator.getValue((obj[i].dir === -1 ? b : a),fld));
				var nb = Number(comparator.getValue((obj[i].dir === -1 ? a : b),fld));
				if  (na < nb) {return -1;}
				if  (na > nb) {return 1;}
				return (typeof obj[i+1] != 'undefined') ? comparator[obj[i+1].type](a,b, obj, i+1) : (a.$_id - b.$_id);
			}
		};
		var sortObjects = [];
		if (typeof argSortArray === 'string') {
			argSortArray = 	argSortArray.replace('{{','').replace('}}', '')
			argSortArray = [argSortArray, argDirection || 1];
		}
		
		if (argSortArray) {
			for (var k=0;k<argSortArray.length;k=k+2) {
				sortObjects.push({'fld' : argSortArray[k],
								 'dir' : Number((argSortArray[k+1] || 1)),
								 'type' :comparator.getDataType(argSortArray[k], data)
								 }                                    
				);
			}
		}
		// TODO to guarantee that the order stays the same when toggle sort when equal
		// TODO should only do this one time
		if (data.length > 0 && typeof data[0].$_id === undefined) {
			Timer.start('makeids')

			for (let n=0,len = data.length ;n<len;n++) {
				data[n].$_id = Number(n);
			}
			Timer.stop('makeids',true)

		}
		data.sort(function(a,b) {return comparator[sortObjects[0].type](a, b, sortObjects, 0)});
	},

	'curTop': (obj, argIsAbsolute) => {
		let mTop = 0;
		if (obj.offsetParent) {
			while (obj) {
				mTop += obj.offsetTop;
				if (argIsAbsolute && this.getStyle(obj, 'position') === 'absolute') {
					break;
				}
				obj = obj.offsetParent;
			}
		} else if (obj.y) {
			mTop += obj.y;
		}
		return mTop;
	}
}
Doo.FieldType = class FieldType {
	constructor(fld, type, klass, instance) {
		this._fld = fld
		this.type = type
		this.klass = klass
		this.instance = instance
		this._func = undefined
		this._parentElem = undefined
		this.$1 = undefined
		this.$2 = undefined
		this.$3 = undefined
		this.$4 = undefined
		this.$5 = undefined

		if (this.type === Doo.$Config.TYPE.COMPUTED) { 
			this.createComputed()
		}	
	}
	set fld(fld) {this._fld=fld}
	set parentElem(parentElem) {this._parentElem = parentElem} 
	set func(func) {this._func = func}
	get fld() {return this._fld}
	get func() {return this._func}

	createComputed() {
		//TODO create a regEx for more elegant parsing
		let breakParams = this.fld.split('(')
		let computedArr = breakParams[0].split('.').reverse()
		let funcName = computedArr[0]
		if (Reflect.ownKeys(this.klass).filter(key=>key===funcName).length > 0) {
			this.func = this.klass[funcName]
			if (Doo.$Computed[funcName]) {
				console.log('WARNING:', 'Overwriting a Doo base Doo.$Computed method is not recommended' );
			}
		} else if (Doo.$Computed[funcName]) { 	
			this.func = Doo.$Computed[funcName]
		}
		this.fld = computedArr.length > 1 ? computedArr[1] : undefined
		if (typeof this.func !== 'function') {
			console.log('static ' + func + '() is not a defined on the Doo base class nor as a static member function')
			type = undefined
		}
		let params = breakParams[1].replace(')','')
		if (params && params.length > 0) {
			params = params.split(',')
			for (let k=0,len=params.length;k<len;k++ ) {
				this['$'+(k+1)]= params[k].replace(/\'/g,'').replace(/"/g,'')
			}
		}
	} 
}

//TODO rename to just Data (maybe) and move all computed methods into here
Doo.DataItem = class DataItem {
	constructor(item, i, arr) {
		this.item = item
		this.i = i
		this.arr = arr
		this._dataSetKey = ''
		this._fld = ''
		this._args = []
		this._searchable = true
	}

	set dataSetKey(dataSetKey) {this._dataSetKey=dataSetKey}
	set fld(fld) {this._fld=fld}
	set args(args) {this._args=args}
    set filterKey(filterKey) {this._filterKey=filterKey}
	set searchAble(searchAble) {this._searchAble = new Boolean(searchAble)}

	get fld() {return this._fld}
    get length() {return this.arr.length}
    get filterKey() {return this._filterKey}

	isSearchable() {
		return this.searchable
	}
	getValue() {
        return this.item[this.fld]
    }
	toString() {
        return JSON.stringify(this.item)
    }
}
Doo.Criteria = class Criteria {
	constuctor(name) {
		this.name = name
	}
}

Doo.EMPTY_ROW = function() {return new Doo.DataItem(item[0],i,[''])}
if (!window.Doo) {
	window.Doo = Doo
}


class Ui extends Doo {
		
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
Doo.define(Ui, 'ui')

export { Doo as default }
