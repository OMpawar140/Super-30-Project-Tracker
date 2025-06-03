# Backend Project Documentation

## Overview
This project is a backend application built with Express.js that utilizes Firebase Authentication for user management. It verifies user tokens issued by Firebase on the frontend and protects API routes using middleware.

## Project Structure
```
backend
├── src
│   ├── app.js
│   ├── config
│   │   └── firebase.js
│   ├── controllers
│   │   └── userController.js
│   ├── middlewares
│   │   └── authMiddleware.js
│   ├── routes
│   │   └── userRoutes.js
│   └── services
│       └── userService.js
├── package.json
└── README.md
```

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project in the Firebase Console.
   - Generate a service account key and save it in the `src/config` directory as `serviceAccountKey.json`.
   - Update `src/config/firebase.js` with your Firebase project credentials.

4. **Run the Application**
   Start the server using:
   ```bash
   node src/app.js
   ```

## Usage
- The application exposes user-related APIs that are protected by Firebase Authentication.
- Use the Firebase client SDK on the frontend to authenticate users and obtain a token.
- Include the token in the Authorization header when making requests to the protected routes.

## Middleware
The `authMiddleware.js` file contains a middleware function that verifies the Firebase token. This middleware is applied to the user routes to ensure that only authenticated users can access them.

## Future Development
- Add more routes and controllers as needed.
- Implement additional middleware for logging, error handling, etc.
- Consider adding unit tests for controllers and services.

## License
This project is licensed under the MIT License.