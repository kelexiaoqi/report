//src/eventdb.js
import client from './dbclient.js';
import fs from 'fs/promises';
const eventsCollection = client.db('TicketSystem').collection('events');

async function getEventById(eventId) {
  try {
    const event = await eventsCollection.findOne({ eventNumber: eventId });
    return event;
  } catch (err) {
    console.error('Error retrieving event by ID', err);
    throw err;
  }
}

async function getAllEvents() {
  try {
    const eventList = await eventsCollection.find({}).toArray();
    return eventList;
  } catch (err) {
    console.error('Error retrieving all events', err);
    throw err;
  }
}

async function createEvent(
  eventNumber,
  starting,
  destination,
  date,
  sTime,
  eTime,
  economyPrice,
  firstClassPrice,
  photopath,
  imageDescription
) {
  try {
    const updateResult = await eventsCollection.updateOne(
      { eventNumber },
      {
        $set: {
          starting,
          destination,
          date,
          sTime,
          eTime,
          seatType: {
            economyPrice,
            firstClassPrice,
          },
          photopath,
          seats: [
            ...new Array(12).fill({ type: 'firstClass', status: 'empty', user: null }),
            ...new Array(30).fill({ type: 'economy', status: 'empty', user: null }),
          ],
          imageDescription,
        },
      },
      { upsert: true }
    );
    //console.log(eventNumber, starting, destination, date, sTime, eTime, economyPrice, firstClassPrice, photopath);
    return true;
  } catch (err) {
    console.error('Error updating event', err);
    throw err;
  }
}
async function updateEvent(
  eventNumber,
  starting,
  destination,
  date,
  sTime,
  eTime,
  economyPrice,
  firstClassPrice,
  photopath,
  imageDescription,
  seats
) {
  try {
    const updateResult = await eventsCollection.updateOne(
      { eventNumber },
      {
        $set: {
          starting,
          destination,
          date,
          sTime,
          eTime,
          seatType: {
            economyPrice,
            firstClassPrice,
          },
          photopath,
          seats,
          imageDescription,
        },
      },
      { upsert: true }
    );
    //console.log(eventNumber, starting, destination, date, sTime, eTime, economyPrice, firstClassPrice, photopath);
    return true;
  } catch (err) {
    console.error('Error updating event', err);
    throw err;
  }
}
async function deleteEvent(eventId) {
  try {
    const deleteResult = await eventsCollection.deleteOne({ eventNumber: eventId });
    return true;
  } catch (err) {
    console.error('Error deleting event', err);
    throw err;
  }
}
async function delete_seat(eventNumber, number) {
  try {
    const event = await eventsCollection.findOne({ eventNumber: eventNumber });

    const updatedSeats = event.seats.slice(0, -number);
    const result = await eventsCollection.updateOne({ eventNumber: eventNumber }, { $set: { seats: updatedSeats } });

    return true;
  } catch (err) {
    console.error('Unable to delete seats from the database!', err);
    throw err;
  }
}

async function add_seat(eventNumber, number) {
  try {
    const seat = new Array(number).fill({ type: 'economy', status: 'empty', user: null });

    const result = await eventsCollection.updateOne(
      { eventNumber: eventNumber },
      { $push: { seats: { $each: seat } } }
    );
    return true;
  } catch (err) {
    console.error('Unable to add seat to the database!', err);
    return false;
  }
}

async function fetch_event(eventNumber) {
  try {
    const event = await eventsCollection.findOne({ eventNumber });

    return event;
  } catch (err) {
    console.error('Unable to fetch from database!', err);
  }
}
async function event_exist(eventNumber) {
  try {
    const user = await fetch_event(eventNumber);

    return user !== null;
  } catch (err) {
    console.error('Unable to fetch from database!', err);
    return false;
  }
}

async function updateSeat(eventNumber, seat) {
  try {
    const updateResult = await eventsCollection.updateOne(
      { eventNumber },
      {
        $set: {
          seats: seat,
        },
      },
      { upsert: true }
    );

    return true;
  } catch (err) {
    console.error('Unable to fetch from database!', err);
    return false;
  }
}

async function fetch_user(users) {
  try {
    const documents = await eventsCollection.find({ 'seats.user': users }).toArray();
    const userSeats = documents.map((doc) => {
      doc.seats = doc.seats
        .map((seat, index) => {
          if (seat.user === users) {
            const row = Math.floor(index / 6) + 1; 
            const col = String.fromCharCode(65 + (index % 6)); 
            return { seatNumber: `${row}${col}`, ...seat }; 
          }
          return null;
        })
        .filter((seat) => seat !== null);

      return doc;
    });
    return userSeats;
  } catch (err) {
    console.error('Unable to fetch from database!', err);
  }
}

export {
  createEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  deleteEvent,
  event_exist,
  add_seat,
  delete_seat,
  updateSeat,
  fetch_user,
};
