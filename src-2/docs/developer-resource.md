# Developer Resources  

This document provides essential details for developers working on **Practicare v1**.  

## 🛠 Local Development Setup  

### 1️⃣ **Clone the Repository**  
```sh
git clone <repo-url>
cd practicare
```

### 2️⃣ Set Up Environment Variables
Create a .env file in the root directory and add the required variables:

```env
Copy
Edit
MONGO_URI=mongodb://localhost:27017/practicare
PORT=3000
JWT_SECRET=<your-secret-key>
AWS_REGION=<your-region>
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

### 3️⃣ Run MongoDB in a Local Container
```sh
docker run --name mongo -d -p 27017:27017 mongo
```

### 4️⃣ Install Dependencies
```sh
npm install
```

### 5️⃣ Start the Application
```sh
npm start
```

## 📂 Folder Structure
```bash
practicare/
│── src/                  # Main application source code  
│   ├── controllers/      # Route controllers (business logic)  
│   ├── models/           # Mongoose schemas/models  
│   ├── routes/           # API route definitions  
│   ├── middleware/       # Express middleware functions  
│   ├── config/           # Configuration files (DB, auth, etc.)  
│   ├── services/         # Business logic separated into services  
│   ├── utils/            # Utility/helper functions  
│   ├── docs/             # Internal documentation  
│── test/                 # Unit and integration tests  
│── public/               # Static assets (if applicable)  
│── .env.example          # Sample environment variable file  
│── package.json          # Node.js dependencies and scripts  
│── README.md             # General project information  
│── developer-resources.md # This file  
```

## 📂 Folder Structure Explained
The Practicare v1 application follows a modular structure that organizes the code in layers. The design follows the onion architecture principle, ensuring that core business logic is separated from infrastructure concerns (like database access, HTTP handling, etc.). This structure also promotes scalability and maintainability.

### 1️⃣ src/ - Main Application Source Code
This is the core of the project. All source code for the application resides in the src/ directory, including business logic, API routes, models, services, and configuration files.

#### controllers/
Contains the route controllers. These files define the actual business logic that responds to HTTP requests. Controllers interact with models, process data, and return responses (such as JSON data) to the client. The controllers are thin, handling just the incoming request and delegating the heavy lifting to services.

Example: userController.js handles the registration and login logic for users.
Key Concept: In an onion architecture, controllers are at the outermost layer, dealing with input/output and not business logic.

#### models/
Contains Mongoose schemas or data models that define the shape of the data in the database. Each model represents an entity in the system, like a User, Product, or Order. The models define the properties and relationships of the data entities.

Example: userModel.js contains the Mongoose schema for users, including fields like name, email, password, etc.
Key Concept: Models are part of the persistence layer (the inner layer of the onion), dealing directly with the database.

#### routes/
Contains all the API route definitions for the app. Each route is mapped to a specific controller and handles HTTP requests (GET, POST, PUT, DELETE). This file imports controller functions and links them to the proper URL endpoint.

Example: userRoutes.js defines routes like /login, /register, and /profile, pointing to corresponding controller methods.
Key Concept: Routes bridge the outermost layer (HTTP requests) to the inner layers (business logic in controllers).

#### middleware/
Contains Express middleware functions. Middleware functions are used to modify the request or response objects or handle actions before reaching route controllers. This includes things like authentication checks, logging, error handling, and validation.

Example: authMiddleware.js ensures that requests to protected routes are authenticated and contain valid JWT tokens.
Key Concept: Middleware lies between the external and internal layers, preprocessing requests before they reach controllers.

#### config/
Contains configuration files for the application. This includes things like database connections, authentication settings, and external API keys. By having a config/ folder, we ensure that configuration settings are centralized and easy to update.

Example: dbConfig.js defines the MongoDB connection URL and options.
Key Concept: This layer is part of the outer ring and is used for configuration and initialization purposes.

#### services/
Contains business logic. Services hold the main processing logic of the application and are the “heart” of the application. Controllers delegate tasks to services, ensuring the controllers stay lightweight and focused on HTTP-specific tasks.

Example: userService.js contains logic for hashing passwords, validating user input, or interacting with other systems.
Key Concept: Services are part of the core business logic and interact directly with models to perform CRUD operations and process data.

#### utils/
Contains helper functions and utilities that can be reused across the application. These can be functions for things like formatting dates, handling custom errors, or creating JWT tokens. By keeping these utilities separate, you ensure your code is DRY (Don't Repeat Yourself).

Example: jwtUtils.js contains a function to generate JWT tokens.
Key Concept: The utility functions provide cross-cutting concerns that don’t belong in other layers but are essential for the app.

#### docs/
This folder contains internal documentation

## 🚀 Deployment

### 1️⃣ Prepare Files for Deployment
```sh
zip -r deploy.zip src package.json package-lock.json
```

### 2️⃣ Deploy to AWS Elastic Beanstalk
```sh
eb deploy
```

## 🔍 Additional Notes
API documentation is inside src/docs.