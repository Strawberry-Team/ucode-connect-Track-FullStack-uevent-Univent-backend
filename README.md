## ⚙️ Requirements and Dependencies
Before starting, ensure the required technologies are installed.
- **Node.JS** >= v22
- **NPM** >= v10
- **MySQL** >= 8.0


## 🚀 How to Run the Solution
1. Clone this repository and move to the project directory:
   ```bash
   git clone <repository-url>
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Configure the database connection by copying `.env.example` to new file `.env`. After that put your MySQL credentials of root user:
    ```
    # Database Root Configuration
    DB_ROOT_HOST=localhost
    DB_ROOT_PORT=3306
    DB_ROOT_USER=root
    DB_ROOT_PASSWORD=root
    ```
   Also, new DB user `uevent_sql` will be created after executing the next command. Credentials of `uevent_sql` user can be changed:
    ```
    # Database App Configuration
    DB_APP_HOST=localhost
    DB_APP_PORT=3306
    DB_APP_USER=uevent_sql
    DB_APP_PASSWORD=securepass
    DB_APP_DATABASE=uevent
    ```
4. Run script for create databases and user:
   ```bash
   npm run setupdb
   ```
5. Run command to apply necessary migrations:
   ```bash
   npm run migrate
   ```
6. Start the server:
    ```bash
    npm run start:dev
   ```
7. Application will be launched on [http://localhost:8080/](http://localhost:8080/).


## 📫 Mailing Service
[Ethereal](https://ethereal.email/) is a fake SMTP service, mostly aimed at Nodemailer and EmailEngine users (but not limited to). It's a completely free anti-transactional email service where messages never get delivered.
To view the letter that the user will receive, you need to log in to this service using a test login and password. Default credentials you can find in `.env.example` or:
* login:
    ```text
    ricky43@ethereal.email
    ```
* password:
    ```text
    4e1zbM2nxsMu2d823E
    ```

## 🔁 REST API documentation
The documentation of all available endpoints can be found [http://localhost:8080/api](http://localhost:8080/api). The [Swagger](https://swagger.io/) library is used.


## 🪲 Unit Testing
Running all tests:

```bash
npm run test
```

Run all tests with detailed report:

```bash
npm run test:watch
```

## 🌱 Seeding Data
Seeds help you fill your database with initial data for a presentation or project launch. To start creating test data, run the command.

```bash
npm run migrate:seed
```