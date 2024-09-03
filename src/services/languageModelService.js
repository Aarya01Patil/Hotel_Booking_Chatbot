const axios = require('axios');
const { getRoomOptions, bookRoom } = require('./roomService');

const STATES = {
  GREETING: 'GREETING',
  AWAIT_BOOKING_REQUEST: 'AWAIT_BOOKING_REQUEST',
  AWAIT_GUEST_COUNT: 'AWAIT_GUEST_COUNT',
  AWAIT_NIGHTS: 'AWAIT_NIGHTS',
  DISPLAY_ROOM_OPTIONS: 'DISPLAY_ROOM_OPTIONS',
  AWAIT_ROOM_SELECTION: 'AWAIT_ROOM_SELECTION',
  AWAIT_GUEST_DETAILS: 'AWAIT_GUEST_DETAILS',
  BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION'
};

class ConversationManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.state = STATES.GREETING;
    this.guestCount = 0;
    this.nights = 0;
    this.roomOptions = [];
    this.selectedRoom = null;
    this.guestDetails = {};
    this.conversationHistory = [];
  }

  async handleMessage(message) {
    this.conversationHistory.push(`Human: ${message}`);
    
    let context = '';
    switch (this.state) {
      case STATES.GREETING:
        context = 'You are a hotel booking assistant. Greet the user and ask how you can help.';
        this.state = STATES.AWAIT_BOOKING_REQUEST;
        break;

      case STATES.AWAIT_BOOKING_REQUEST:
        if (message.toLowerCase().includes('book') && message.toLowerCase().includes('room')) {
          context = 'Ask the user for the number of guests.';
          this.state = STATES.AWAIT_GUEST_COUNT;
        } else {
          context = 'Remind the user that you are here to help with room bookings and ask if they want to book a room.';
        }
        break;

      case STATES.AWAIT_GUEST_COUNT:
        const guestCount = parseInt(message);
        if (!isNaN(guestCount) && guestCount > 0) {
          this.guestCount = guestCount;
          context = 'Ask the user for the number of nights they want to stay.';
          this.state = STATES.AWAIT_NIGHTS;
        } else {
          context = 'Ask the user to provide a valid number of guests.';
        }
        break;

      case STATES.AWAIT_NIGHTS:
        const nights = parseInt(message);
        if (!isNaN(nights) && nights > 0) {
          this.nights = nights;
          context = 'Inform the user that you will check for available rooms.';
          this.state = STATES.DISPLAY_ROOM_OPTIONS;
        } else {
          context = 'Ask the user to provide a valid number of nights.';
        }
        break;

      case STATES.DISPLAY_ROOM_OPTIONS:
        await this.fetchRoomOptions();
        if (this.roomOptions.length > 0) {
          const roomList = this.roomOptions.map((room, index) => 
            `${index + 1}. ${room.type} - $${room.totalPrice} for ${this.nights} night(s)`
          ).join('\n');
          context = `Present the following room options to the user and ask them to select one by number:\n${roomList}`;
          this.state = STATES.AWAIT_ROOM_SELECTION;
        } else {
          context = 'Inform the user that no rooms are available for the specified duration and ask if they want to try different dates.';
          this.state = STATES.AWAIT_BOOKING_REQUEST;
        }
        break;

      case STATES.AWAIT_ROOM_SELECTION:
        const selection = parseInt(message) - 1;
        if (selection >= 0 && selection < this.roomOptions.length) {
          this.selectedRoom = this.roomOptions[selection];
          context = 'Ask the user to provide their full name, email, and phone number (separated by commas).';
          this.state = STATES.AWAIT_GUEST_DETAILS;
        } else {
          context = 'Inform the user that their selection is invalid and ask them to choose a number from the list of available rooms.';
        }
        break;

      case STATES.AWAIT_GUEST_DETAILS:
        const [fullName, email, phone] = message.split(',').map(item => item.trim());
        if (fullName && email && phone) {
          this.guestDetails = { fullName, email, phone };
          context = 'Inform the user that you will now process their booking.';
          this.state = STATES.BOOKING_CONFIRMATION;
        } else {
          context = 'Ask the user to provide all required information: full name, email, and phone number.';
        }
        break;

      case STATES.BOOKING_CONFIRMATION:
        try {
          const booking = await bookRoom(this.selectedRoom.id, this.guestDetails.fullName, this.guestDetails.email, this.nights);
          context = `Confirm the booking with the following details: Room type: ${this.selectedRoom.type}, Nights: ${this.nights}, Booking ID: ${booking.id}, Email: ${this.guestDetails.email}. Ask if there's anything else you can help with.`;
        } catch (error) {
          console.error('Error booking room:', error);
          context = 'Inform the user that there was an error processing their booking and suggest they try again or contact support.';
        }
        this.reset();
        break;

      default:
        context = 'Ask the user how you can assist them with their room booking.';
    }

    const response = await this.generateResponse(context);
    this.conversationHistory.push(`Assistant: ${response}`);
    return response;
  }

  async fetchRoomOptions() {
    try {
      this.roomOptions = await getRoomOptions(this.nights);
    } catch (error) {
      console.error('Error fetching room options:', error);
      this.roomOptions = [];
    }
  }

  async generateResponse(context) {
    const prompt = `${this.conversationHistory.join('\n')}\nContext: ${context}\nAssistant:`;
    
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/gpt2',
        { inputs: prompt },
        {
          headers: {
            'Authorization': 'Bearer YOUR_HUGGING_FACE_API_KEY',
            'Content-Type': 'application/json'
          }
        }
      );

      let generatedText = response.data[0].generated_text;
      generatedText = generatedText.split('Human:')[0].trim();
      return generatedText;
    } catch (error) {
      console.error('Error generating response:', error);
      return "I apologize, but I'm having trouble generating a response right now. How else can I assist you with your booking?";
    }
  }
}

const conversationManagers = new Map();

async function handleChatbotResponse(message, conversationId) {
  if (!conversationManagers.has(conversationId)) {
    conversationManagers.set(conversationId, new ConversationManager());
  }

  const manager = conversationManagers.get(conversationId);
  return await manager.handleMessage(message);
}

module.exports = { handleChatbotResponse };