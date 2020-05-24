Doo.define(
    class card extends Doo {

        constructor() {
            super(3);
            this.defaultDataSet = 'business';
            this.data = {
                [this.defaultDataSet]: new Mock([], 20)
            };
        }

        static getCoolio(dataItem) {
            return dataItem.item.lname.toUpperCase();
        }
    }
);