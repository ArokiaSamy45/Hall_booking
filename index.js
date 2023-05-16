
import express from 'express';
const app = express();
app.use(express.json());

// Local storage for rooms and bookings
let rooms = [];
let bookings = [];

// API endpoint for creating a room
app.post('/rooms', (req, res) => {
  const { seatsAvailable, amenities, pricePerHour } = req.body;
  const room = {
    id: rooms.length + 1,
    seatsAvailable,
    amenities,
    pricePerHour,
  };
  rooms.push(room);
  res.status(201).json(room);
});

// API endpoint for booking a room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  
  // Check if the room is available for the given date and time
  const isRoomAvailable = bookings.every(booking => {
    return (
      booking.roomId !== roomId ||
      date !== booking.date ||
      (startTime >= booking.endTime || endTime <= booking.startTime)
    );
  });

  if (!isRoomAvailable) {
    return res.status(409).json({ error: 'Room already booked for the given date and time.' });
  }

  const booking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
  };
  bookings.push(booking);
  res.status(201).json({ customerName, ...booking });
});


// API endpoint to list all rooms with booked data
app.get('/rooms/bookings', (req, res) => {
  const data = rooms.map(room => {
    const roomBookings = bookings.filter(booking => booking.roomId === room.id);
    if (roomBookings.length === 0) {
      return null; // Exclude rooms with no bookings
    }
    const bookingsWithCustomerNames = roomBookings.map(booking => ({
      customerName: booking.customerName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    }));
    return {
      roomName: `Room ${room.id}`,
      bookedStatus: 'Booked',
      bookings: bookingsWithCustomerNames,
    };
  }).filter(room => room !== null);
  res.json(data);
});










/// API endpoint to list all customers with booked data
app.get('/customers/bookings', (req, res) => {
  const data = bookings.map(booking => {
    const room = rooms.find(room => String(room.id) == String(booking.roomId));
    return {
      customerName: booking.customerName,
      roomName: room ? `Room ${room.id}` : 'Unknown Room',
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });
  res.json(data);
});


// API endpoint to list booking details for a specific customer
app.get('/customers/:customerName/bookings', (req, res) => {
  const customerName = req.params.customerName;
  const data = bookings.filter(booking => booking.customerName === customerName)
    .map(booking => ({
      customerName: booking.customerName,
      roomName: `Room ${booking.roomId}`,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    }));
  res.json(data);
});


// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
