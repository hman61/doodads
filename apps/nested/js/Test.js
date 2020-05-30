Doo.define(
	class Test extends Doo {

		constructor() {
			super(2)
			this.status='loading...'
			this.data = {
				test: new Mock([], 2)
			}
		}
		static other(args) {
			let idx = parseInt(args.instance.getAttribute('key'))
			if (args.item.location.city !== args.instance.getParent().data['contacts'][idx].location.city) {
				return args.item.location.city
			}
		}
	}
)
