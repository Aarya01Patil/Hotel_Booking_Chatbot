# Hotel Booking Chatbot

This project implements a chatbot for hotel room bookings using Express.js and OpenAI's API.

## Preview
![Screenshot 2024-09-03 190422](https://github.com/user-attachments/assets/a2ea03fd-820e-4f13-a88d-2fe7b2bb04bd)


## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory with the following content:
    ```
    OPENAI_API_KEY=your_openai_api_key(paste your key here)
    PORT=3000
    ```

## Usage

1. Start the server: `npm start`
2. Open your browser and navigate to `http://localhost:3000`

## Features

- Book hotel rooms
- Check room availability
- Cancel bookings
- Modify existing bookings

## API Endpoints

- `POST /api/book` - Book a room
- `GET /api/availability` - Check room availability
- `DELETE /api/cancel` - Cancel a booking
- `PUT /api/modify` - Modify a booking

## Technologies Used

- Node.js
- OpenAI API

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
