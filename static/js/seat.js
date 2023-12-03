$(document).ready(function () {
  function fetchEventDetails(eventNumber) {
    $.ajax({
      url: '/api/events/' + eventNumber,
      type: 'GET',
      success: function (eventData) {
        tilteCreate(eventData);
        heightSet(eventData);
      },
      error: function (error) {
        console.error('Error fetching event details:', error);
      },
    });
  }

  function tilteCreate(eventData) {
    $('#staringTitle').text(`${eventData.starting}`);
    $('#destinationTitle').text(`${eventData.destination}`);
    $('#dateTitle').text(`${eventData.date}`);
    $('#sTimeTitle').text(`${eventData.sTime}`);
    $('#eTimeTitle').text(`${eventData.eTime}`);
    $('#firstClass').text(`${eventData.seatType.firstClassPrice}`);
    $('#economy').text(`${eventData.seatType.economyPrice}`);
  }

  function heightSet(eventData) {
    var cols = 6;
    var rows = eventData.seats.length / cols;

    const ygap = 70;
    const height = ygap * rows + 50;
    $('svg').attr('height', height);
    createSeat(eventData, rows);
  }
  function createSeat(eventData, rows) {
    var seats = eventData.seats;
    var seatsPrice = eventData.seatType;
    //var seatsNumber = eventData.seats.length - 1;
    var seatsCurrent = 0;
    var flagFirst = 'firstClass';
    var seatSize = 50;
    var ygap = 50;
    for (let row = 1; row <= rows; row++) {
      if (row > 2) {
        flagFirst = '';
      }
      if (row > 1) {
        ygap += 70;
      }

      var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('id', `row-${row}`);
      group.setAttribute('transform', `translate(200, ${ygap})`);
      $('#seat-map').append(group);
      var colNumber = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      colNumber.setAttribute('x', 0);
      colNumber.setAttribute('y', 25);
      colNumber.setAttribute('font-size', '20px');
      colNumber.textContent = row;
      group.appendChild(colNumber);
      var xgap = 30;
      var xgapText = 50;
      for (var col = 0; col < 6; col++) {
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('class', seats[seatsCurrent].status + ' ' + seats[seatsCurrent].type);
        rect.setAttribute('x', xgap);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', seatSize);
        rect.setAttribute('height', seatSize);
        if (seats[seatsCurrent].type == 'firstClass') {
          rect.setAttribute('data-seatsprice', seatsPrice.firstClassPrice);
        } else {
          rect.setAttribute('data-seatsprice', seatsPrice.economyPrice);
        }
        rect.setAttribute('data-seatnumber', seatsCurrent);
        rect.setAttribute('data-identifier', row + String.fromCharCode(65 + col));
        group.appendChild(rect);

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', xgapText);
        text.setAttribute('y', 30);
        text.setAttribute('fill', 'white');
        text.setAttribute('data-seatNumber', seatsCurrent);
        text.setAttribute('data-identifier', row + String.fromCharCode(65 + col));
        var textUnavailable = '';
        if (seats[seatsCurrent].status == 'unavailable') {
          textUnavailable = ' textUnavailable';
        }
        text.setAttribute('class', 'seat-identifier ' + seats[seatsCurrent].type + textUnavailable);
        text.textContent = String.fromCharCode(65 + col);
        group.appendChild(text);

        seatsCurrent += 1;
        if (col == 2) {
          xgap += 100;
          xgapText += 100;
        } else {
          xgap += 60;
          xgapText += 60;
        }
      }
    }
  }
  function getEventNumberFromUrl() {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get('eventNumber');
  }

  const eventNumber = getEventNumberFromUrl();

  if (eventNumber) {
    fetchEventDetails(eventNumber);
  } else {
    console.error('No event number provided in the URL.');
  }

  var totalCost = 0;

  var selectedSeatsInfo = {};
  function updateSelectedSeatsDisplay() {
    var selectedIdentifiers = Object.keys(selectedSeatsInfo);

    if (selectedIdentifiers.length > 0) {
      var selectedDisplayText = selectedIdentifiers.join(' ');
      $('#selected-seats').text('Selected: ' + selectedDisplayText);
      $('#selectedText').removeClass('d-none');
    } else {
      $('#selected-seats').text('');
      $('#selectedText').addClass('d-none');
    }
  }
  var selectedNumber = $('#seat-map').on('click', 'rect.empty, rect.selected, text.seat-identifier', function () {
    var $rect = $(this).is('rect') ? $(this) : $(this).prev('rect');
    var seatPrice = $($rect).data('seatsprice');
    var seatNumber = $($rect).data('seatnumber');
    var identifier = $($rect).data('identifier');

    console.log(seatNumber, seatPrice, identifier);
    if (!$rect.hasClass('unavailable')) {
      $rect.toggleClass('selected empty');
      if ($rect.hasClass('selected')) {
        totalCost += seatPrice;
        selectedSeatsInfo[identifier] = {
          seatNumber: seatNumber,
          identifier: identifier,
        };
      } else {
        totalCost -= seatPrice;
        delete selectedSeatsInfo[identifier];
      }

      console.log(selectedSeatsInfo);
      updateSelectedSeatsDisplay();

      $('#price').text(totalCost);
    }
  });

  $('#confirmBook').on('click', function () {
    var selectedSeatsData = Object.values(selectedSeatsInfo);

    if (selectedSeatsData.length > 0 && confirm('Do you confirm your seat selection?')) {
      var eventNumber = getEventNumberFromUrl();
      var queryParams = selectedSeatsData
        .map((seat) => {
          return `seatNumber=${seat.seatNumber}&identifier=${seat.identifier}`;
        })
        .join('&');
      console.log(`payment.html?eventNumber=${eventNumber}&${queryParams}`);
      window.location.href = `payment.html?eventNumber=${eventNumber}&${queryParams}`;
    } else {
      alert('Please select at least one seat.');
    }
  });

  $('#backButton').on('click', function (e) {
    e.preventDefault();
    window.history.back();
  });
});
