Doo.define(
    class card extends Doo {

        constructor() {
            super(3);
            this.defaultDataSet = 'business';
            this.data = {
                [this.defaultDataSet]: new Mock([], 20)
            }
        }
		static stockImg(args) {
			if (args.item.sex === 'M') {
				return 'Team1.jpg'
			} else {
                console.log(args.i % 2)
				return args.i % 2 === 0  ? 'Team2.jpg' : 'Team3.jpg'
			}
		}


        static show(args) {
            return 'visibile'
        }
        afterRender() {
            this.style.visibility = 'visible'
        }

    }
);