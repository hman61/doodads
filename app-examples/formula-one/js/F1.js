Doo.define(
	class F1 extends Doo {
		constructor() {
			super(50)
			this.defaultDataSet = 'driverList'
			this.data = {}
		}

		async init() {
			let url = 'http://ergast.com/api/f1/2013/driverStandings.json'
			let responseText = await Doo.fetchURL(url)
			const responseObj = JSON.parse(responseText);
			//TODO make this work on template data-fetch
			this.data[this.defaultDataSet] = responseObj.MRData.StandingsTable.StandingsLists[0].DriverStandings

		}

		find(elem) {
			this.filterKey = elem.value
			this.setDataFilter(this.defaultDataSet) 	
			this.render()
		}
	}
)

			
	