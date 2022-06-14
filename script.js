const mentiUrl = 'https://api.mentimeter.com/questions/c3616436febb/result?isPublic=true';

const url = 'https://api.mentimeter.com/questions/c3616436febb/result?isPublic=true';

const threshold = 2;

const intervalSeconds = 30;

const attributes = ['visa', 'amount', 'price', 'rank'];

const tableContainer = $('#table-container');

const spinnerTableContainer = $('.spinner-table-container');

const spinnerAnnount = $('.spinner-annount');

const mentiLink = $('#menti-link');

const allHistoryCheck = $('#allCheck');

async function fetchBidData() {
  const response = await fetch(url);
  const data = await response.json();
  return data?.results;
}

function getRedundantData(sortedBidData) {
  const frequentVisaBid = {};

  const filterBidData = sortedBidData.reduce((acc, curr, idx, arr) => {
    if (curr.redund || curr.wrong) {
      acc.push(curr);
    } else if (curr.amount > threshold) {
      acc.push({ ...curr, redund: false, wrong: true });
    } else {
      if (idx !== arr.findIndex(item => item.visa === curr.visa)) {
        acc.push({ ...curr, redund: true, wrong: false });
      } else {
        acc.push({ ...curr, redund: false, wrong: false });
      }
    }

    return acc;

  }, []); 

  return filterBidData;
}

function filterShowAllHistory(applyRedundantData) {
  if (allHistoryCheck.is(':checked')) {
    return applyRedundantData;
  } else {
    return applyRedundantData.filter(item => !item.redund && !item.wrong);
  }
}

function formatBidData(bidData) {
  const formatedBidData = bidData.reduce(
    (acc, curr) => {
      let [visa, amount, price] = curr.split("-");

      if (!visa || !amount || !price) {
        acc.push({ ...curr, wrong: true, redund: false });
      } else {
        visa = visa.trim();
        amount = parseInt(amount.trim());
        price = parseInt(price.trim().replace(/[.]/g, ''));

        if (visa.length < 3 || amount < 1 || isNaN(amount) || isNaN(price)) {
          acc.push({ ...curr, wrong: true, redund: false });
        } else acc.push({visa, amount, price});
      }

      return acc;
    }, []
  )

  formatedBidData.sort((a, b) => a.price - b.price).reverse();

  const applyRedundantData = getRedundantData(formatedBidData);

  const filteredBidData = filterShowAllHistory(applyRedundantData);

  let accRank = 1;
  for (let item of filteredBidData) {
    if (item.redund || item.wrong) {
      item.rank = 0;
    } else {
      item.rank = accRank;
      accRank += item.amount;
    }
  }

  return filteredBidData;
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
    const tbodyr = $(`<tr class=${item.redund || item.wrong ? 'redund-or-wrong' : ''}></tr>`);

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
  const table = $('<table class="table table-striped table-hover table-bordered text-center"></table>');

  applyHeader(table);
  applyBody(table, bidData);

  tableContainer.append(table);
}

async function clearFetchAndCreateTable() {
  tableContainer.hide();
  spinnerTableContainer.css('display', 'flex');

  const data = await fetchBidData().then(data => formatBidData(data));
  tableContainer.empty();
  createTable(data);

  spinnerTableContainer.hide();
  tableContainer.show();
}

$(document).ready(async function () {
  clearFetchAndCreateTable();

  console.log('Please don\'t crack me!');

  setInterval(() => {
    spinnerAnnount.visible();

    clearFetchAndCreateTable();

    setTimeout(() => {
      spinnerAnnount.invisible();
    }, 1500);

  }, intervalSeconds * 1000 );


  mentiLink.attr('href', mentiUrl);
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

allHistoryCheck.on('change', () => {
  clearFetchAndCreateTable();
});