const mentiUrl = 'https://api.mentimeter.com/questions/c3616436febb/result?isPublic=true';

const url = 'https://api.mentimeter.com/questions/c3616436febb/result?isPublic=true';

const threshold = 2;

const intervalSeconds = 30;

const attributes = ['visa', 'amount', 'price', 'rank'];

async function fetchBidData() {
  const response = await fetch(url);
  const data = await response.json();
  return data?.results;
}

function getRedundantData(sortedBidData) {
  const frequentVisaBid = {};

  const filteredBidData = sortedBidData.reduce((acc, curr) => {
    const frequent = frequentVisaBid[curr.visa] || 0;

    curr.redund = false;

    if (frequent >= threshold) {
      curr.redund = true;
      acc.push(curr);
    }

    else if (curr.amount + frequent <= threshold) {
      frequentVisaBid[curr.visa] = frequent + curr.amount;
      curr.redund = false;
      acc.push(curr);
    }

    else if (curr.amount + frequent > threshold) {
      const acceptAmount = threshold - frequent;

      acc.push({ ...curr, amount: acceptAmount, redund: false });
      acc.push({ ...curr, amount: curr.amount - acceptAmount, redund: true });

      frequentVisaBid[curr.visa] = frequent + curr.amount;
    }

    return acc;
  }, []);

  console.log(filteredBidData);
  return filteredBidData;
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

  const applyRedundantData = getRedundantData(formatedBidData);

  let accRank = 1;
  for (let item of applyRedundantData) {
    if (item.redund) {
      item.rank = 0;
    } else {
      item.rank = accRank;
      accRank += item.amount;
    }
  }

  return applyRedundantData;
}

function applyHeader(table) {
  const thead = $('<thead class="table-dark"></thead>');

  const theadr = $('<tr></tr>');

  $.each(attributes, (index, header) => {
    const th = $(`<th class=${header}></th>`).html(header.toLocaleUpperCase());
    theadr.append(th);
  });

  table.append(thead.append(theadr));
}

function formatPrice(price) {
  return Intl.NumberFormat('vi', {style: 'currency', currency: 'VND'}).format(price);
}

function applyBody(table, bidData) {
  const tbody = $('<tbody></tbody>');


  $.each(bidData, (index, item) => {
    const tbodyr = $(`<tr class=${item.redund ? 'redund' : ''}></tr>`);

    $.each(attributes, (index, col) => {
      const td = $(`<td class=${col}></td>`);
      
      if (col === 'price') {
        td.html(formatPrice(item[col]));
      } else {
        td.html(item[col]);
      }
    
      tbodyr.append(td);
    });

    tbody.append(tbodyr);
  });

  table.append(tbody);
}

function createTable(bidData) {
  const tableContainer = $('#table-container');

  const table = $('<table class="table table-striped table-hover table-bordered text-center"></table>');

  applyHeader(table);
  applyBody(table, bidData);

  tableContainer.append(table);
}

async function clearFetchAndCreateTable() {
  $('#table-container').empty();
  const data = await fetchBidData().then(data => formatBidData(data));
  createTable(data);
}

$(document).ready(async function () {
  clearFetchAndCreateTable();

  setInterval(() => {
    $('.spinner-border').visible();
    clearFetchAndCreateTable();

    setTimeout(() => {
      $('.spinner-border').invisible();
    }, 1500);

  }, intervalSeconds * 1000 );


  $('#menti-link').attr('href', mentiUrl);
});

(function($) {
  $.fn.invisible = function() {
      return this.each(function() {
          $(this).css("visibility", "hidden");
      });
  };
  $.fn.visible = function() {
      return this.each(function() {
          $(this).css("visibility", "visible");
      });
  };
}(jQuery));