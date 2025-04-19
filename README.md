# Student Management System

A full-stack application for managing student information and their marks, built with React, Node.js, Express, and PostgreSQL (Neon cloud database).

## Project Structure

```
├── backend/           # Express server
│   ├── src/           # Source code
│   │   ├── controllers/ # Request handlers
│   │   ├── db/        # Database configuration and scripts
│   │   ├── middleware/ # Express middleware
│   │   ├── routes/    # API routes
│   │   └── server.js  # Server entry point
│   ├── .env           # Environment variables (not in git)
│   ├── .env.example   # Example environment variables
│   ├── package.json   # Dependencies and scripts
│   └── setup-db.js    # Database setup script
├── frontend/         # React application
│   ├── public/        # Static files
│   ├── src/           # Source code
│   ├── .env           # Environment variables (not in git)
│   ├── .env.example   # Example environment variables
│   └── package.json   # Dependencies and scripts
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Neon PostgreSQL account (or any PostgreSQL database)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd student-management-system
```

2. Set up the backend

```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up the frontend

```bash
cd ../frontend
npm install

# Create .env file from example
cp .env.example .env
# Edit .env with your backend API URL
```

4. Initialize the database

```bash
cd ../backend
npm run setup-db
```

### Development

1. Start the backend server

```bash
cd backend
npm run dev
```

2. Start the frontend development server

```bash
cd frontend
npm start
```

## Production Deployment

### Backend Deployment

1. Set environment variables for production

```bash
# Make sure NODE_ENV is set to 'production'
NODE_ENV=production
PORT=5001
DATABASE_URL=your-neon-postgres-connection-string
```

2. Install production dependencies

```bash
cd backend
npm install --production
```

3. Start the server

```bash
npm run prod
```

### Frontend Deployment

1. Set environment variables for production

```bash
# Create a .env.production file
REACT_APP_API_URL=https://your-backend-api-url.com/api
```

2. Build the application

```bash
cd frontend
npm run build
```

3. Deploy the build folder to your hosting provider (Netlify, Vercel, etc.)

## Security Features

The application includes several security features:

- **Helmet**: Sets secure HTTP headers
- **Rate Limiting**: Prevents abuse of the API
- **XSS Protection**: Sanitizes user input to prevent cross-site scripting attacks
- **HPP**: Prevents HTTP parameter pollution
- **Compression**: Compresses HTTP responses
- **CORS**: Configures Cross-Origin Resource Sharing
- **SSL**: Secure connection to Neon PostgreSQL database

## Environment Variables

### Backend

- `PORT`: Server port (default: 5001)
- `NODE_ENV`: Environment (development, production)
- `DATABASE_URL`: Neon PostgreSQL connection string
- `CORS_ORIGIN`: Allowed origins for CORS (in production)

### Frontend

- `REACT_APP_API_URL`: Backend API URL

## License

This project is licensed under the MIT License.
