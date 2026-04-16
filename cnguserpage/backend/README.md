# CNG Station Finder - Backend

Backend API for CNG Station Finder built with Express.js and MongoDB.

## Prerequisites

- Node.js (v16+)
- MongoDB (running locally or cloud)
- npm or yarn

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/cng-station
JWT_SECRET=your_jwt_secret_key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development (with hot reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Users
- `GET /api/users/profile` - Get user profile (requires token)
- `PUT /api/users/profile` - Update user profile (requires token)
- `PUT /api/users/settings` - Update user settings (requires token)
- `POST /api/users/favorites` - Add favorite station (requires token)
- `DELETE /api/users/favorites/:stationId` - Remove favorite station (requires token)

## Database Schema

### User Model
```
{
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  phone: String
  location: String
  joinDate: Date
  settings: {
    notifications: Boolean
    locationTracking: Boolean
    autoRefresh: Boolean
    darkMode: Boolean
    units: String (metric|imperial)
    language: String
    stockAlerts: Boolean
    priceAlerts: Boolean
  }
  favorites: [
    {
      stationId: String
      stationName: String
      addedAt: Date
    }
  ]
}
```

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env` is correct
- Try default local connection: `mongodb://localhost:27017/cng-station`

### CORS Errors
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Default: `http://localhost:5173`

### JWT Token Expired
- Tokens expire after 7 days
- User needs to login again to get a new token
