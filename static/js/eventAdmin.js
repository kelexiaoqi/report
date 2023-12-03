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

  function fetchAndDisplayEvents() {
    $.ajax({
      url: '/api/events',
      type: 'GET',
      dataType: 'json',
      success: function (events) {
        events.forEach((event) => createEventCard(event));
      },
      error: function (error) {
        console.error('Error fetching events:', error);
      },
    });
  }

  function createEventCard(event) {
    const cardHtml = `
      <div class="col mt-2 mb-2">
  <div class="card">
    <img
      width="200"
      height="300"
      src="${event.photopath}"
      class="border rounded card-img-top"
      alt="${event.imageDescription}"
    />
    <div class="card-body">
      <div class="card-title fw-bold fs-4">
        <div>${event.imageDescription}</div>
      </div>
      <hr>
      <div class="container">
        <div class="row">
          <div class="col-auto  text-center">
          Starting: ${event.starting}
          </div>
        </div>
        <div class="row">
          <div class="col-auto text-center">
          Destination: ${event.destination}
          </div>
        </div>
        <hr>
        <div class="row fw-bold" >
          <div class="col-auto">
            Date: ${event.date}
          </div>
        </div>
        <div class="row fw-bold">
          <div class="col-auto">
            Departure Time: ${event.sTime}
          </div>
        </div>
        <div class="row fw-bold">
          <div class="col-auto">
            Arrival Time: ${event.eTime}
          </div>
        </div>
      </div>
      <hr>
      <div class="d-flex mt-3">
        <p class="badge bg-secondary fs-6 text-start">Economy</p>
        <p class="fs-6 fw-bold">Price: $${event.seatType.economyPrice}</p>
      </div>
      <div class="d-flex">
        <p class="badge bg-warning fs-6 text-start">First class</p>
        <p class="fs-6 fw-bold">Price: $${event.seatType.firstClassPrice}</p>
      </div>
      <hr>
      <div class="d-flex">
        <button
          type="button"
          class="btn btn-warning ms-2 eventEditing"
          data-eventnumber="${event.eventNumber}"
        >
          Event editing
        </button>
      </div>
    </div>
  </div>
</div>
    `;
    $('#event').append(cardHtml);
  }

  fetchAndDisplayEvents();

  $(document).on('click', '.eventEditing', function () {
    var eventNumber = $(this).data('eventnumber');
    window.location.href = `selectSeatAdmin.html?eventNumber=${eventNumber}`;
  });
});

$(document).ready(function () {
  $('#createEventForm').on('submit', function (e) {
    e.preventDefault();
    event.preventDefault();
    var starting = $('#starting').val();
    var destination = $('#destination').val();
    var date = $('#date').val();
    var sTime = $('#sTime').val();
    var eTime = $('#eTime').val();
    var economyPrice = $('#economyPrice').val();
    var firstClassPrice = $('#firstClassPrice').val();
    var eventNumber = $('#eventNumber').val();
    var imageDescription = $('#imageDescription').val();
    var fileInput = $('#photoPath')[0];
    if (fileInput.files.length > 0) {
      var file = fileInput.files[0];
    }
    let formData = new FormData();
    formData.append('eventNumber', eventNumber);
    formData.append('starting', starting);
    formData.append('destination', destination);
    formData.append('date', date);
    formData.append('sTime', sTime);
    formData.append('eTime', eTime);
    formData.append('economyPrice', economyPrice);
    formData.append('firstClassPrice', firstClassPrice);
    formData.append('file', file);
    formData.append('imageDescription', imageDescription);

    $.ajax({
      url: '/create',
      type: 'POST',
      data: formData,
      dataType: 'json',
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.status === 'success') {
          alert(response.message);
          window.location.href = '/eventAdmin.html';
        } else {
          alert('Failed to create event: ' + response.message);
        }
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log('Error response:', xhr.responseText);
        if (xhr.status === 410) {
          alert('Event number already exists.');
        } else {
          alert('An error occurred: ' + textStatus + ' - ' + errorThrown);
        }
      },
    });
  });
});

$(document).ready(function () {
  $('#logout').click(function () {
    let logout = confirm('Confirm to logout?');
    if (logout) {
      $.ajax({
        url: '/auth/logout',
        type: 'POST',
        success: function () {
          window.location.href = 'login.html';
        },
        error: function () {
          alert('Error');
        },
      });
    }
  });
});
