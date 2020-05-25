this.columnDefs = [
        {
          headerName: "Athlete",
          field: "athlete",
          width: 150,
          suppressSizeToFit: true,
          enableRowGroup: true,
          rowGroupIndex: 0
        },
        {
          headerName: "Age",
          field: "age",
          width: 90,
          minwidth: 75,
          maxWidth: 100,
          enableRowGroup: true
        },
        {
          headerName: "Country",
          field: "country",
          width: 120,
          enableRowGroup: true
        },
        {
          headerName: "Year",
          field: "year",
          width: 90,
          enableRowGroup: true,
          pivotIndex: 0
        },
        {
          headerName: "Sport",
          field: "sport",
          width: 110,
          enableRowGroup: true
        },
        {
          headerName: "Gold",
          field: "gold",
          width: 60,
          enableValue: true,
          suppressMenu: true,
          filter: "agNumberColumnFilter",
          aggFunc: "sum"
        },
        {
          headerName: "Silver",
          field: "silver",
          width: 60,
          enableValue: true,
          suppressMenu: true,
          filter: "agNumberColumnFilter",
          aggFunc: "sum"
        },
        {
          headerName: "Bronze",
          field: "bronze",
          width: 60,
          enableValue: true,
          suppressMenu: true,
          filter: "agNumberColumnFilter",
          aggFunc: "sum"
        },
        {
          headerName: "Total",
          field: "total",
          width: 60,
          enableValue: true,
          suppressMenu: true,
          filter: "agNumberColumnFilter",
          aggFunc: "sum"
        }
    ]     