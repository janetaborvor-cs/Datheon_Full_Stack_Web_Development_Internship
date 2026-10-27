# WeatherWise 

A responsive weather dashboard built for the Datheon Full Stack Web Development Internship Task 3.

WeatherWise allows users to search for a city and view its current weather conditions and five-day forecast through a clean, modern interface featuring a Lavender Dream theme.

##  Features

- Search for weather by city name.
- Display current weather conditions.
- View a five-day weather forecast.
- Show weather details such as temperature and humidity.
- Handle invalid city names and API errors.
- Responsive design for desktop and mobile devices.
- Lavender-themed interface with glass-effect cards.
- Backend API integration to keep the weather API key out of frontend JavaScript.

##  Technologies Used

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- OpenWeather API

##  Getting Started

### Prerequisites

- Node.js and npm installed.
- An OpenWeather API key.

### Installation

1. Clone or download this repository.
2. Open the project folder in your terminal.
3. Install the dependencies:

   
   npm install
   

4. Create a `.env` file in the project root and add your API key:

   
   OPENWEATHER_API_KEY=your_api_key_here
   

   Replace `your_api_key_here` with your own API key. Do not commit your `.env` file.

5. Start the application:

   
   npm start
   

6. Open `http://localhost:3000` in your browser.

##  API Key Security

The API key is stored in the backend environment configuration rather than in frontend JavaScript. The `.env` file is excluded from Git using `.gitignore`.

##  Responsive Design

WeatherWise is designed to work on desktop, tablet, and mobile screens.

##  Project

**Datheon Full Stack Web Development Internship — Task 3**

Built as an internship project to demonstrate frontend development, backend API integration, responsive styling, and error handling.
