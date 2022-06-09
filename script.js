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
  const tableHeader = document.createElement('thead');
  tableHeader.className = 'table-dark';

  const headerRow = document.createElement('tr');
  for (let header of attributes) {
    const th = document.createElement('th');

    th.className = header;
    th.innerText = header.toLocaleUpperCase();

    headerRow.appendChild(th);
  }
  tableHeader.appendChild(headerRow);

  table.appendChild(tableHeader);
}

function formatPrice(price) {
  return Intl.NumberFormat('vi', {style: 'currency', currency: 'VND'}).format(price);
}

function applyBody(table, bidData) {
  const tableBody = document.createElement('tbody');

  for (let item of bidData) {
    const tr = document.createElement('tr');

    for (let attribute of attributes) {
      const td = document.createElement('td');

      td.className = attribute;
      td.innerText = attribute === 'price' ? formatPrice(item[attribute]) : item[attribute];

      tr.appendChild(td);
    }

    tableBody.appendChild(tr);
  }

  table.appendChild(tableBody);
}

function createTable(bidData) {
  const tableContainer = document.getElementById('table-container');

  const table = document.createElement('table');
  table.className = 'table table-striped table-hover table-bordered text-center';

  applyHeader(table);
  applyBody(table, bidData);

  tableContainer.appendChild(table);
}

window.addEventListener('load', async () => {
  const data = await fetchBidData().then(data => formatBidData(data));
  
  createTable(data);
});