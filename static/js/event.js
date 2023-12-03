$(document).ready(function () {
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

  // create
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
          class="btn btn-primary ms-2 bookEvent"
          data-eventnumber="${event.eventNumber}"
        >
          Booking
        </button>
      </div>
    </div>
  </div>
</div>
    `;
    $('#event').append(cardHtml);
  }

  fetchAndDisplayEvents();

  $(document).on('click', '.bookEvent', function () {
    var eventNumber = $(this).data('eventnumber');
    window.location.href = `selectSeat.html?eventNumber=${eventNumber}`;
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
