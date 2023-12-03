import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  createEvent,
  event_exist,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  add_seat,
  delete_seat,
  updateSeat,
  fetch_user,
} from './eventdb.js';

const app = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });


app.post('/create', upload.single('file'), async (req, res) => {
  try {
    var { starting, destination, date, sTime, eTime, economyPrice, firstClassPrice, eventNumber, imageDescription } =
      req.body;
    const eventData = req.body;
    const file = req.file;
    //console.log(file);

    if (await event_exist(eventNumber)) {
      return res.status(410).json({ status: 'failed', message: 'Event number already exists' });
    }

    // Move and rename the file
    const newFilename = `${imageDescription}_${eventNumber}${path.extname(file.originalname)}`;
    const newFilePath = `./static/assets/${newFilename}`;
    fs.renameSync(file.path, newFilePath);
    var photopath = '/assets/' + newFilename;
    // Create event in database
    const create = await createEvent(
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
    );
    // Send response
    res.status(200).json({ status: 'success', message: 'Event created successfully', eventNumber: create });
  } catch (error) {
    console.error('Error creating the event:', error);
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/edit-event', upload.single('file'), async (req, res) => {
  try {
    var {
      starting,
      destination,
      date,
      sTime,
      eTime,
      economyPrice,
      firstClassPrice,
      eventNumber,
      imageDescription,
      file,
      oldEventNumber,
    } = req.body;
    var eventExist = await event_exist(eventNumber);
    if (eventExist && eventNumber != oldEventNumber) {
      return res.status(200).json({ status: 'failed', message: 'Event number already exists' });
    }
    const eventDetails = await getEventById(oldEventNumber);
    var photopath = eventDetails.photopath;

    if (file != 0) {
      file = req.file;
      const newFilename = `${imageDescription}_${eventNumber}${path.extname(file.originalname)}`;
      const newFilePath = `./static/assets/${newFilename}`;
      fs.renameSync(file.path, newFilePath);
      photopath = '/assets/' + newFilename;
    }
    var seats = eventDetails.seats;
    // Create event in database
    if (oldEventNumber != eventNumber) {
      const deleteOld = await deleteEvent(oldEventNumber);
    }
    const create = await updateEvent(
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
    );
    res.status(200).json({ status: 'success', message: 'Event update successfully' });
  } catch (error) {
    console.error('Error creating the event:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const allEvents = await getAllEvents();
    res.json(allEvents);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api/events/:eventNumber', async (req, res) => {
  try {
    const eventNumber = req.params.eventNumber;

    const eventDetails = await getEventById(eventNumber);
    if (!eventDetails) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(eventDetails);
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).send('Server error');
  }
});

app.post('/api/manage-seats', async (req, res) => {
  var { rowsCount, action, eventNumber } = req.body;
  var number = rowsCount * 6;
  console.log(rowsCount, action, eventNumber);
  try {
    if (action === 'create') {
      // Logic to create seats
      var addSeat = await add_seat(eventNumber, number);
      if (addSeat) {
        res.status(200).json({ status: 'success', message: `Created ${rowsCount} rows of seats.` });
      } else {
        res.status(500).json({ message: `Failed to create ${rowsCount} rows of seats.` });
      }
    } else if (action === 'delete') {
      // Logic to delete seats
      var deleteSeat = await delete_seat(eventNumber, number);
      if (deleteSeat) {
        res.status(200).json({ status: 'success', message: `Deleted ${rowsCount} rows of seats.` });
      } else {
        res.status(500).json({ message: `Failed to create ${rowsCount} rows of seats.` });
      }
    } else {
      res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('Error managing seat rows:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payment', async (req, res) => {
  var { eventNumber, seatNumbers } = req.body;
  console.log(eventNumber, seatNumbers, req.session.username);

  try {
    const username = req.session.username; 

    var event = await getEventById(eventNumber);
    if (!event) {
      return res.status(404).send({ status: 'failed', message: 'Event not found' });
    }


    const canBookAllSeats = seatNumbers.every((number) => {
      const seat = event.seats[number].status; 
      return seat === 'empty';
    });

    if (!canBookAllSeats) {
      return res.status(400).send({ status: 'failed', message: 'One or more seats are not available' });
    }
    var seat = event.seats;

    seatNumbers.forEach((number) => {
      seat[number].status = 'unavailable';
      seat[number].user = username;
    });


    var update = await updateSeat(eventNumber, seat);
    if (update) {
      res.status(200).send({ status: 'success', message: 'Booking successfully' });
    } else {
      res.status(200).send({ status: 'failed', message: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/api/delete-event', async (req, res) => {
  var eventNumber = req.body.eventNumber;

  try {
    var event = await getEventById(eventNumber);
    if (event) {
      var status = await deleteEvent(eventNumber);
      if (status) {
        res.status(200).send({ status: 'success', message: 'Delete event successfully' });
      }
    }
  } catch (error) {
    console.error('Error managing seat rows:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const allTickets = await fetch_user(req.session.username);
    res.json(allTickets);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
export default app;
