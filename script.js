const mentiUrl = 'https://api.mentimeter.com/questions/c3616436febb/result?isPublic=true';

const url = 'https://api.mentimeter.com/questions/c3616436febb/result?isPublic=true';

const threshold = 2;

const intervalSeconds = 30;

const attributes = ['visa', 'amount', 'price', 'rank'];

const tableContainer = $('#table-container');

const spinnerTableContainer = $('.spinner-table-container');

const spinnerAnnount = $('.spinner-annount');

const mentiLink = $('#menti-link');

async function fetchBidData() {
  const response = await fetch(url);
  const data = await response.json();
  return data?.results;
}

function getRedundantData(sortedBidData) {
  const frequentVisaBid = {};

  // const filteredBidData = sortedBidData.reduce((acc, curr) => {
  //   const frequent = frequentVisaBid[curr.visa] || 0;

  //   curr.redund = false;

  //   if (frequent >= threshold) {
  //     curr.redund = true;
  //     acc.push(curr);
  //   }

  //   else if (curr.amount + frequent <= threshold) {
  //     frequentVisaBid[curr.visa] = frequent + curr.amount;
  //     curr.redund = false;
  //     acc.push(curr);
  //   }

  //   else if (curr.amount + frequent > threshold) {
  //     const acceptAmount = threshold - frequent;

  //     acc.push({ ...curr, amount: acceptAmount, redund: false });
  //     acc.push({ ...curr, amount: curr.amount - acceptAmount, redund: true });

  //     frequentVisaBid[curr.visa] = frequent + curr.amount;
  //   }

  //   return acc;
  // }, []);

  const filterBidData = sortedBidData.reduce((acc, curr, idx, arr) => {
    if (curr.amount > threshold) {
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