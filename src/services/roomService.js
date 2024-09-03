const axios = require('axios');

async function getRoomOptions(numDays) {
  try {
    const response = await axios.get('https://bot9assignement.deno.dev/rooms');
    return response.data.map(room => ({
      ...room,
      totalPrice: room.price * numDays
    }));
  } catch (error) {
    console.error('Error fetching room options:', error.message);
    throw error;
  }
}

async function bookRoom(roomId, fullName, email, nights) {
  try {
    const response = await axios.post('https://bot9assignement.deno.dev/book', {
      roomId,
      fullName,
      email,
      nights
    });
    return response.data;
  } catch (error) {
    console.error('Error booking room:', error.message);
    throw error;
  }
}

module.exports = { getRoomOptions, bookRoom };