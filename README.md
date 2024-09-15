# Node Boilerplate TS App

This project is a Node.js application using TypeScript, Docker, and MySQL. It includes Prisma for database management and Docker Compose for easy setup and management of development environments.

## Prerequisites

Before you start, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

Follow these steps to set up and run the project:

### 1. Clone the Repository

Clone the repository to your local machine:

git clone <repository-url>
cd <repository-directory>

Replace `<repository-url>` with the URL of your repository and `<repository-directory>` with the name of the directory where the repository is cloned.

### 2. Set Up Environment Variables

Create a `.env` file in the root directory of the project with the following content:

```env
PORT=5002
NODE_ENV="development" # development, staging, production
GOOGLE_CLIENT_ID=""
EMAIL_USER="youremail@example.com"
EMAIL_PASS=""
FRONTEND_URL="http://localhost:3000"

# auth >>>
JWT_ACCESS_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-jwt-secret"
JWT_ACCESS_EXPIRATION='15m'  # Access tokens should be short-lived
JWT_REFRESH_EXPIRATION='7d'  # Refresh tokens can have longer lifetimes


# database
DATABASE_URL="mysql://root:password@localhost:3306/node_boilerplate" #for local connection

# for docker connection >>>>>>>>>>>>
DATABASE_USER="root"
DATABASE_NAME="node_boilerplate"
DATABASE_PASSWORD="123456"
DATABASE_PORT=3306
DATABASE_HOST="db"
DATABASE_URL="mysql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}" 
# for docker connection <<<<<<<<<<<<<

```
Create a `.env.test` file in the root directory of the project to run tests with the following content:
```
PORT=5002
NODE_ENV="development" # development, staging, production
GOOGLE_CLIENT_ID=""
EMAIL_USER="youremail@example.com"
EMAIL_PASS=""
FRONTEND_URL="http://localhost:3000"

# auth >>>
JWT_ACCESS_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-jwt-secret"
JWT_ACCESS_EXPIRATION='15m'  # Access tokens should be short-lived
JWT_REFRESH_EXPIRATION='7d'  # Refresh tokens can have longer lifetimes


# database
DATABASE_URL="mysql://root:password@localhost:3306/node_boilerplate" #for local connection

# for docker connection >>>>>>>>>>>>
# DATABASE_USER="root"
# DATABASE_NAME="node_boilerplate"
# DATABASE_PASSWORD="123456"
# DATABASE_PORT=3307
# DATABASE_HOST="localhost"
# DATABASE_URL="mysql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}" 
# for docker connection <<<<<<<<<<<<<

```

### 3. Run Docker Compose to build and start the containers:

```
docker-compose up --build
```

### 4. Accessing the Application

Once the containers are up and running, you can access the application at: http://localhost:5002

### 5. Stopping the Containers

To stop and remove the containers, use:
```
docker-compose down
```








