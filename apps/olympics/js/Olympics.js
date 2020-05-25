Doo.define(
	class Olympics extends Doo {
		constructor() {
			super(50)
			this.scrollTarget = Doo.$Config.FLEX_BODY
			this.defaultDataSet = 'athletes'
			this.data = {}
		}
		async init() {
			//any code prior to rendering goes here
		}
	}
)	
