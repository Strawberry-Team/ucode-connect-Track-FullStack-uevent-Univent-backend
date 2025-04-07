## ⚙️ Requirements and Dependencies
Before starting, ensure the required technologies are installed.
- **Node.JS** >= v22
- **NPM** >= v10
- **MySQL** >= 8.0


## 🚀 How to Run the Solution
1. Clone this repository and move to the project directory.
   ```bash
   git clone <repository-url>
   ```
2. Install the dependencies.
   ```bash
   npm install
   ```
3. Configure the database connection by copying [.env.example](.env.example) to new file `.env`. After that put your MySQL credentials of root and new DB user:
    ```
    # Database Root Configuration
    DB_ROOT_HOST=localhost
    DB_ROOT_PORT=3306
    DB_ROOT_USER=root
    DB_ROOT_PASSWORD=root

    # Database App Configuration
    DB_APP_HOST=localhost
    DB_APP_PORT=3306
    DB_APP_USER=uevent_sql
    DB_APP_PASSWORD=securepass
    DB_APP_DATABASE=uevent
    ```
4. Run script for create databases and user.
   ```bash
   npm run setup-database
   ```
5. Run command to apply necessary migrations.
   ```bash
   npm run migrate
   ```
6. Start the server.
    ```bash
    npm run start:dev
   ```
