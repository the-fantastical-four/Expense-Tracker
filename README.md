# Expense Tracker

- You can visit the deployed app [expense-cracker.herokuapp.com](https://expense-cracker.herokuapp.com/)
- The revised project proposal can also be found in [docs/CCAPDEV Project Proposal](docs/CCAPDEV%20Project%20Proposal.pdf)

## Members
- Go, Eldrich
- Opalla, Rijan
- Oquias, Sophia

## Installation Instructions 
**To run locally:** 
1. Fork this repository (or skip to step 2 and clone right away)
2. Clone the forked repository 
```shell
git clone <link to your forked repository>
```
3. Navigate to the directory
```shell
cd CCAPDEV_MP
```
4. Install all dependencies in `package.json` 
```shell
npm install
```
5. Run the server using the script defined as 
```shell
npm run server
```
- You can also use this script to run to aid in **testing and debugging**
```shell
npm run dev
``` 
1. Open [http://localhost:3000](http://localhost:3000) on your browser to open the app

**Note:** .env file was included in repository to aid local setup of app using node

## Access Sample Data
Sample data for the app can be accessed through these account credentials
- username: `mrkrabs`
- password: `secretformula`

## Node Packages Used: 
- express
- mongodb
- mongoose
- express-handlebars
- express-session
- connect-mongo
- express-validator
- connect-flash
- nodemon
- bcrypt
- dotenv
