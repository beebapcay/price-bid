const url = 'https://api.mentimeter.com/questions/c3616436febb/result?isPublic=true';

const attributes = ['visa', 'amount', 'price', 'rank'];

async function fetchBidData() {
  const response = await fetch(url);
  const data = await response.json();
  return data?.results;
}

function formatBidData(bidData) {
  const formatedBidData = bidData.reduce(
    (acc, curr) => {
      let [visa, amount, price] = curr.split("-");

      visa = visa.trim();
      amount = parseInt(amount.trim());
      price = parseInt(price.trim().replace(/[.]/g, ''));

      acc.push({visa, amount, price});

      return acc;
    }, []
  )

  formatedBidData.sort((a, b) => a.price - b.price).reverse();

  return formatedBidData.map((item, index, arr) => {
    item.rank = arr[index - 1] ? arr[index - 1].rank + arr[index - 1].amount : 1;
    return item;
  });
}

function applyHeader(table) {
  const thead = $('<thead class="table-dark"></thead>');

  const theadr = $('<tr></tr>');
  for (let header of attributes) {
    const th = $(`<th class=${header}></th>`).html(header.toLocaleUpperCase());
    
    theadr.append(th);
  }
  thead.append(theadr);

  table.append(thead);
}

function formatPrice(price) {
  return Intl.NumberFormat('vi', {style: 'currency', currency: 'VND'}).format(price);
}

function applyBody(table, bidData) {
  const tbody = $('<tbody></tbody>');

  for (let item of bidData) {
    const tbodyr = $('<tr></tr>');

    for (let attribute of attributes) {
      const td = $(`<td class=${attribute}></td>`).html(attribute === 'price' ? formatPrice(item[attribute]) : item[attribute]);

      tbodyr.append(td);
    }

    tbody.append(tbodyr);
  }

  table.append(tbody);
}

function createTable(bidData) {
  const tableContainer = $('#table-container');

  const table = $('<table class="table table-striped table-hover table-bordered text-center"></table>');

  applyHeader(table);
  applyBody(table, bidData);

  tableContainer.append(table);
}

$(document).ready(async function () {
  const data = await fetchBidData().then(data => formatBidData(data));
  
  createTable(data);
});