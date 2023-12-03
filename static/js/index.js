$(document).ready(function () {
  $.ajax({
    url: '/auth/me',
    type: 'GET',
    dataType: 'json',
    success: function (data) {},
    error: function () {
      alert('Please login');
      window.open('login.html', '_self');
    },
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

  function createEventCard(event) {
    const cardHtml = `
      <div class="col mt-2 mb-2">
        <div class="card">
          <img width="200" height="300" src="${event.photopath}" alt="${event.imageDescription}" class="card-img-top">
          <div class="card-body">
            <div class="card-title fw-medium">
              <div class="d-flex justify-content-between fw-bold">
                <p>${event.starting}</p>
                <p class="fs-5 fw-bold">&#8594;</p>
                <p>${event.destination}</p>
              </div>
              <div class="fw-bold">${event.date}</div>
              <div class="d-flex justify-content-between fw-bold">
                <p>${event.sTime}</p>
                <p>&ndash;</p>
                <p>${event.eTime}</p>
              </div>
            </div>
            <div class="d-flex">
              <p class="badge bg-secondary fs-6 text-start">Economy</p>
              <p class="fs-5 fw-bold">Price: $${event.seat_type.economyPrice}</p>
            </div>
            <div class="d-flex">
              <p class="badge bg-warning fs-6 text-start">First class</p>
              <p class="fs-5 fw-bold">Price: $${event.seat_type.firstClassPrice}</p>
            </div>
            <a href="selectSeat.html" class="btn btn-primary" key="${event.eventNumber}">Book</a>
          </div>
        </div>
      </div>
    `;
    $('#event').append(cardHtml);
  }

  fetchAndDisplayEvents();
});
