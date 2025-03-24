# Practicare v1

Practicare is an application designed for **mental health professionals and businesses** to efficiently manage their practice.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (Latest LTS recommended)
- **Docker** (For running MongoDB in a local container)
- **AWS Elastic Beanstalk CLI** (For deployment)

### 🔧 Setup and Run

1. **Clone the Repository:**
   ```sh
   git clone <repo-url>
   cd practicare
   ```

2. **Create a `.env` File:**
   - Copy the `.env.example` file to `.env` and update the necessary environment variables.
   ```sh
   cp .env.example .env
   ```

3. **Run MongoDB in a Local Container:**
   ```sh
   docker run --name mongo -d -p 27017:27017 mongo
   ```

4. **Install Dependencies:**
   ```sh
   npm install
   ```

5. **Start the App:**
   ```sh
   npm start
   ```

## 🚀 Deployment to AWS Beanstalk

To push updates to hosting:

1. **Zip the necessary files:**
   ```sh
   zip -r deploy.zip src package.json package-lock.json
   ```

2. **Manually Upload to AWS Elastic Beanstalk:**
   - Log in to the AWS Management Console.
   - Navigate to the Elastic Beanstalk service.
   - Select your application and environment.
   - Upload the `deploy.zip` file through the console interface.

## 📄 Further Documentation

For more details, refer to the developer documentation inside `src/docs`.

© 2024 Practicare. All rights reserved.
