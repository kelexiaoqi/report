$(document).ready(function () {
  $.ajax({
    url: '/auth/admin',
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      if (data.role !== 'admin') {
        alert('You are not an admin.');
        window.history.back();
      }
    },

    error: function () {
      alert('An error occurred while checking your admin status.');
      window.history.back();
    },
  });

  function fetchEventDetails(eventNumber) {
    $.ajax({
      url: '/api/events/' + eventNumber,
      type: 'GET',
      success: function (eventData) {
        tilteCreate(eventData);
        heightSet(eventData);
        populateEditForm(eventData);
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
  }
  function populateEditForm(eventData) {
    $('#eventNumber').val(eventData.eventNumber);
    $('#starting').val(eventData.starting);
    $('#destination').val(eventData.destination);
    $('#date').val(eventData.date);
    $('#sTime').val(eventData.sTime);
    $('#eTime').val(eventData.eTime);
    $('#economyPrice').val(eventData.seatType.economyPrice);
    $('#firstClassPrice').val(eventData.seatType.firstClassPrice);
    $('#imageDescription').val(eventData.imageDescription);
  }

  function heightSet(eventData) {
    var cols = 6;
    var rows = eventData.seats.length / cols;

    const ypoint = 50;
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
      //var currentSeat = row * 6 - 6;

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
          rect.setAttribute('data-seatsPrice', seatsPrice.firstClassPrice);
        } else {
          rect.setAttribute('data-seatsPrice', seatsPrice.economyPrice);
        }
        rect.setAttribute('data-seatNumber', seatsCurrent);
        rect.setAttribute('data-identifier', row + String.fromCharCode(65 + col));
        group.appendChild(rect);

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', xgapText);
        text.setAttribute('y', 30);
        text.setAttribute('fill', 'white');
        text.setAttribute('data-seatNumber', seatsCurrent);
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

  $('#cancelButton').on('click', function (e) {
    e.preventDefault();
    var confirmation = confirm('Are you sure you want to delete this event?');
    if (confirmation) {
      $.ajax({
        url: '/api/delete-event',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ eventNumber: eventNumber }),
        success: function (response) {
          if (response.status === 'success') {
            alert('Event deleted successfully.');
            window.location.href = 'eventAdmin.html';
          } else {
            alert('Failed to delete event: ' + response.message);
          }
        },
        error: function (xhr, status, error) {
          alert('An error occurred while deleting the event: ' + error);
        },
      });
    }
  });

  $('#backButton').on('click', function (e) {
    e.preventDefault();
    window.location.href = 'eventAdmin.html';
  });
});

$(document).ready(function () {
  $('#seatManagementForm').on('submit', function (e) {
    e.preventDefault();
    const rowsCount = $('#rowsInput').val();
    const action = $(document.activeElement).val();
    const queryParams = new URLSearchParams(window.location.search);
    const eventNumber = queryParams.get('eventNumber');
    console.log(action);
    const data = {
      rowsCount: rowsCount,
      action: action,
      eventNumber: eventNumber,
    };

    $.ajax({
      url: '/api/manage-seats',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function (response) {
        if (response.status === 'success') {
          alert(response.message);
          window.location.href = `selectSeatAdmin.html?eventNumber=${eventNumber}`;
        } else {
          alert(response.message || 'Create failed');
        }
      },
      error: function (xhr, status, error) {
        console.error('Error performing action:', xhr.responseText);
      },
    });
  });

  $('#editEventForm').on('submit', function (e) {
    e.preventDefault();
    const queryParams = new URLSearchParams(window.location.search);
    var oldEventNumber = queryParams.get('eventNumber');
    var fileInput = $('#photoPath')[0];
    var file = 0;
    if (fileInput.files.length > 0) {
      file = fileInput.files[0];
    }

    var formData = new FormData(this);
    formData.delete('photoPath');
    formData.append('file', file);
    formData.append('oldEventNumber', oldEventNumber);
    /*
    for (var pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }*/

    $.ajax({
      url: '/api/edit-event',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.status === 'success') {
          alert(response.message);
          window.location.href = `selectSeatAdmin.html?eventNumber=${formData.get('eventNumber')}`;
        } else {
          alert(response.message || 'Create failed');
        }
      },
      error: function (xhr, status, error) {
        console.error(error);
      },
    });
  });
});
