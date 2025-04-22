## ⚙️ Requirements and Dependencies

Before starting, ensure the required technologies are installed.

- **Node.JS** >= v22
- **NPM** >= v10
- **MySQL** >= 8.0

## 🚀 How to Run the Solution

In the examples of all commands in the text `<env>` is the name of the environment to perform the migration, e.g. `dev`,
`test` or `prod`.

1. Clone this repository and move to the project directory:
   ```bash
   git clone <repository-url>
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. For development purposes use `dev` environment. Configure the database connection by copying the
   `.env.development.example` to a new file `.env.development`. After that put your MySQL credentials of root user:
    ```
    # Database Root Configuration
    DB_ROOT_HOST=localhost
    DB_ROOT_PORT=3306
    DB_ROOT_USER=root
    DB_ROOT_PASSWORD=root
    ```
   Also, new DB user `uevent_sql` will be created after executing the next command. Credentials of `uevent_sql` user can
   be changed:
    ```
    # Database App Configuration
    DB_APP_HOST=localhost
    DB_APP_PORT=3306
    DB_APP_USER=uevent_sql
    DB_APP_PASSWORD=securepass
    DB_APP_DATABASE=uevent
    ```
   For test purposes use `test` environment: create `.env.test` file by copying the `.env.test.example` file.
4. Run script for create databases and user:
   ```bash
   npm run setup:db
   ```
//TODO: подумать, как сделать так, чтобы наименьше надо было выполнять команд
5. Run command to apply necessary migrations.
   ```bash
   npm run migrate
   ```
6. Run command to create prisma client:
   ```bash
   npm run migrate:generate
   ```
7. Run command to build the project:
   ```bash
   npm run build
   ```
8. Seeds help you fill your database with initial data for a presentation or project launch. To start creating test data, run the command:
    ```bash
    npm run migrate:seed
    ```
9. Start the server:
    ```bash
    npm run start:dev
    ```
10. Application will be launched on [http://localhost:8080/](http://localhost:8080/).

## 🐋 Docker
Environment variables are taken from `.env.development` file. You can start containers with the command:
```
docker-compose --env-file .env.development up -d
```
To view a list of containers:
```
docker ps -a
```
To stop running containers:
```
docker-compose stop
```
To stop and delete containers, networks, and associated resources (with volumes):
```
docker-compose down -v
```

## 📫 Mailing Service

[Ethereal](https://ethereal.email/) is a fake SMTP service, mostly aimed at Nodemailer and EmailEngine users (but not
limited to). It's a completely free anti-transactional email service where messages never get delivered.
To view the letter that the user will receive, you need to log in to this service using a test login and password.
Default credentials you can find in `.env.development.example` file or:

* login:
    ```text
    ricky43@ethereal.email
    ```
* password:
    ```text
    4e1zbM2nxsMu2d823E
    ```

## 🔁 REST API documentation

The documentation of all available endpoints can be found [http://localhost:8080/api](http://localhost:8080/api).
The [Swagger](https://swagger.io/) library is used.

## Migrations

1. To create new migration run command:
    ```bash
    npm run migrate:create --name <migration_name>
    ```
2. To refresh all data at the database run command:
    ```bash
    npm run migrate:refresh
    ```

## 🪲 Testing

For all commands in the text below, the environment is a `test` that uses the variables of the `.env.test.example` file.

1. Unit tests
    * Run all unit tests with a detailed report:
    ```bash
    npm run test:unit
    ```
    * Run one specific unit test file with a detailed report:
    ```bash
    npm run test:unit -- <file_name>
    ```
2. End-to-end (e2e) testing
    * Run all e2e tests with detailed report:
    ```bash
    npm run test:e2e
    ```
    * Run one specific e2e test file with a detailed report:
    ```bash
    npm run test:e2e -- <file_name>
    ```
3. All testing
    * Run all e2e and unit tests with detailed report:
   ```bash
   npm run test
   ```

## 👤 Fake Data
To fill the database with demo data of users, companies, events and tickets, run the following command:
```bash
npm run migarte:seed
```
Here is the fake data for presentations.

User data for testing:
* full name:
   ```text
   Test User
   ```
* email:
  ```text
  test.user@uevent.com
  ```
All users have a password:
```text
Password123!$
```
