$(document).ready(function () {
  function fetchAndDisplayTickets() {
    $.ajax({
      url: '/api/tickets',
      type: 'GET',
      dataType: 'json',
      success: function (tickets) {
        tickets.forEach((ticket, ticketIndex) => {
          if (ticket.seats && Array.isArray(ticket.seats)) {
            ticket.seats.forEach((seat, seatIndex) => {
              createTicketCard(ticket, seat);
            });
          } else {
            console.error(`No seats array found for ticket at index ${ticketIndex}:`, ticket);
          }
        });
      },
      error: function (xhr, status, error) {
        console.error('Error fetching tickets:', xhr, status, error);
      },
    });
  }

  function createTicketCard(ticket, seat) {
    console.log(ticket);
    console.log(seat);
    var priceSeat = seat.type === 'economy' ? ticket.seatType.economyPrice : ticket.seatType.firstClassPrice;
    const ticketHtml = `
      <div class="col mt-2 mb-2">
        <div class="card">
          <div class="card-body">
            <div class="card-title fw-medium">
              <div class="d-flex justify-content-between fw-bold">
                <p>${ticket.starting}</p>
                <p class="fs-5 fw-bold">&#8594;</p>
                <p>${ticket.destination}</p>
              </div>
              <div class="fw-bold">${ticket.date}</div>
              <div class="d-flex justify-content-between fw-bold">
                <p>${ticket.sTime}</p>
                <p>&ndash;</p>
                <p>${ticket.eTime}</p>
              </div>
              <div class="mt-3 mb-3">
                <p class="fs-5 fw-bold">Seat Number: ${seat.seatNumber}</p>
              </div>
              <div class="d-flex">
                <p class="badge ${seat.type === 'economy' ? 'bg-secondary' : 'bg-warning'} fs-6 text-start">${
                  seat.type
                }</p>
                <p class="fs-5 fw-bold">Price: $${priceSeat}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    $('#ticket').append(ticketHtml);
  }

  fetchAndDisplayTickets();
});
