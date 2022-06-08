const axios = require("axios");
const numeral = require('numeral');

axios('https://api.mentimeter.com/questions/c3616436febb/result?isPublic=true')
  .then(response => {
    const resultBid = response.data.results;
    
    const formatResultsBid = resultBid.reduce(
      (acc, curr) => {
        let [visa, amount, price] = curr.split("-");

        visa = visa.trim();
        amount = parseInt(amount.trim());
        price = price.trim().replace(/[.]/g, '');

        acc.push({visa, amount, price});

        return acc;
      }, []
    )

    formatResultsBid.sort((a, b) => a.price - b.price);
    formatResultsBid.reverse();

    const result = formatResultsBid.map((item, index, arr) => {
      item.rank = arr[index - 1] ? arr[index - 1].rank + arr[index - 1].amount : 1;
      item.price = numeral(item.price).format('0,0');
      return item;
    });

    console.table(formatResultsBid);
  });