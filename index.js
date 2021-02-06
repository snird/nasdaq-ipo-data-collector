const axios = require('axios').default;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: './ipos_data.csv',
  header: [
    { id: 'dealID', title: 'deal id' },
    { id: 'proposedTickerSymbol', title: 'proposed ticker' },
    { id: 'companyName', title: 'company name' },
    { id: 'proposedExchange', title: 'proposed exchange' },
    { id: 'proposedSharePrice', title: 'proposed share price' },
    { id: 'sharesOffered', title: 'shares offered' },
    { id: 'pricedDate', title: 'date' },
    { id: 'pricedYear', title: 'year' },
    { id: 'pricedMonth', title: 'month' },
    { id: 'dollarValueOfSharesOffered', title: 'dollar value of offering' },
  ]
});

const { isBefore, add, format, parse, formatISO } = require('date-fns')


const start_date = new Date('1998-01-01')
const end_date = new Date('2021-01-01')

let current_date = start_date

const run = async () => {
  while (isBefore(current_date, end_date)) {
    let format_month = format(current_date, 'yyyy-LL')
    let response = await axios.get(`https://api.nasdaq.com/api/ipo/calendar?date=${format_month}`)
    const data = response.data.data

    if (data.priced) {
      let priced = data.priced.rows

      if (priced) {
        priced = priced.map((priced_item) => {
          let parsed_date = parse(priced_item.pricedDate, 'MM/dd/yyyy', new Date())
          priced_item.pricedDate = formatISO(parsed_date)
          priced_item.pricedYear = format(parsed_date, 'yyyy')
          priced_item.pricedMonth = format(parsed_date, 'MM')
          return priced_item
        })
        await csvWriter.writeRecords(priced)
        console.log("Processed ", format_month)
      } else {
        console.log("Priced is not defined for date ", format_month)
      }
    }


    current_date = add(current_date, { months: 1 })
  }
}

run()