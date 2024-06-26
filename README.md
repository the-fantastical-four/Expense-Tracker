# Expense Tracker

## Members
- Capada, Annika 
- Deculawan, Ryan
- Garcia, Lauren
- Oquias, Sophia

## Preqrequisits 
**To run this you will need the following** 
- Node.js (preferrably v16)
- MySQL Server

## Installation Instructions 
**To run locally:** 
1. Fork this repository (or skip to step 2 and clone right away)
2. Clone the forked repository 
```shell
git clone https://github.com/the-fantastical-four/Expense-Tracker.git
```
3. Navigate to the directory
```shell
cd Expense-Tracker
```
4. Install all dependencies in `package.json` 
```shell
npm install
```
5. Set up the schema script in mysql
6. Create a `.env` file and fill-out the necessary information according to your mysql server set up
```
PORT=3000
HOST="localhost"
DB_USER="<your user>"
DB_PASSWORD="<your pass>"
DATABASE="accountdb"
SESSION_KEY="<your session key>"
```
7. Run the server using the script defined as 
```shell
npm run server
```
- You can also use this script to run to aid in **testing and debugging**
```shell
npm run dev
``` 
1. Open [http://localhost:3000](http://localhost:3000) on your browser to open the app
