$(document).ready(function () {
  function fetchEventDetails(eventNumber) {
    $.ajax({
      url: '/api/events/' + eventNumber,
      type: 'GET',
      success: function (eventData) {
        tilteCreate(eventData);

        //seatMap(eventData);
      },
      error: function (error) {
        console.error('Error fetching event details:', error);
      },
    });
  }

  const seatNumbers = getQueryParams('seatNumber');
  const identifiers = getQueryParams('identifier');
  const eventNumber = getQueryParams('eventNumber')[0];
  var totalCost = 0;
  function getQueryParams(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.getAll(param);
  }

  if (eventNumber) {
    fetchEventDetails(eventNumber);
  } else {
    console.error('No event number provided in the URL.');
  }
  function tilteCreate(eventData) {
    $('#staringTitle').text(`${eventData.starting}`);
    $('#destinationTitle').text(`${eventData.destination}`);
    $('#dateTitle').text(`${eventData.date}`);
    $('#sTimeTitle').text(`${eventData.sTime}`);
    $('#eTimeTitle').text(`${eventData.eTime}`);
    $('#selectedId').text(identifiers.join(', '));
    for (var x = 0; x < seatNumbers.length; x++) {
      var seatIndex = parseInt(seatNumbers[x], 10);
      var typeSeat = eventData.seats[seatIndex].type;
      if (typeSeat == 'economy') {
        totalCost += parseInt(eventData.seatType.economyPrice, 10);
      } else {
        totalCost += parseInt(eventData.seatType.firstClassPrice, 10);
      }
      console.log(totalCost);
    }
    console.log(totalCost);
    $('#totalCost').text(totalCost);
  }

  $('#backButton').on('click', function (e) {
    e.preventDefault();
    window.history.back();
  });

  $('form').on('submit', function (e) {
    e.preventDefault();

    var formData = {
      name: $('#name').val(),
      cardNumber: $('#cardNumber').val(),
      expiryDate: $('#expiryDate').val(),
      cvv: $('#cvv').val(),
      eventNumber: eventNumber,
      seatNumbers: seatNumbers,
    };

    $.ajax({
      url: '/api/payment',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(formData),
      success: function (response) {
        alert(response.message);
        window.location.href = 'event.html';
      },
      error: function (xhr, status, error) {
        console.error('Payment failed:', error);
      },
    });
  });
});
