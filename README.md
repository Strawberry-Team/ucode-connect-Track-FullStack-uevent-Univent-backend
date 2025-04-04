## ⚙️ Requirements and Dependencies
Before starting, ensure the required technologies are installed.
- **Node.JS** >= v22
- **NPM** >= v10
- **MySQL** >= 8.0


## 🚀 How to run
1. Clone this repository and move to the project directory.
   ```bash
   git clone <repository-url>
   ```
2. Install the dependencies.
   ```bash
   npm install
   ```
3. Configure the database connection by copying [.env.example](.env.example) to new file `.env`. After that put your MySQL credentials of root and new DB user. 
4. Run script for create databases and user.
   ```shell
   npm run setup-database
   ```