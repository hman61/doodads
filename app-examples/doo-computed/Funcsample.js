Doo.define(
  	class Funcsample extends Doo {
		constructor() {
			super()
			this.data = {
				'sample':[
					{
						letter: "a",
						value: 65,
						first: 'Kimberly',
						last: 'Doe'
					}, 
					{
						letter: "b",
						value: 66,
						first: 'Robert',
						last: 'Smith'
					}
				]	
			}
		}
	
		static getName(args) {
			return args.item.last +  ", "  + args.item.first
		}
	} 
) 