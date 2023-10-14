# Moodle Quiz Generator

Moodle Quiz Generator is a static website that uses ChatGPT-3 for generating quizzes.

## Installation
### Database
Install postgres to start working with the database:
```bash
apt --yes install postgresql
```
Enter into psql prompt:
```bash
sudo -u postgres psql
```
Create database and Grant priviliges:
```
CREATE DATABASE yourdbname;
CREATE USER youruser WITH ENCRYPTED PASSWORD 'yourpass';
GRANT ALL PRIVILEGES ON DATABASE yourdbname TO youruser;
```
Create extension citext for your database:
```
psql =# \c yourdbname
CREATE EXTENSION citext;
```
Then execute queries in migrations file. You're now done configuring database.
### Environmental variables
```bash
npm install
```
Create ".env" file in the project directory.

Inside of ".env":

```bash
OPENAI_API_KEY=<openai api key>
PORT=<port>

# Google OAuth 2.0
GOOGLE_CLIENT_ID=<google client id>
GOOGLE_CLIENT_SECRET=<google client secret>

PGUSER=<postgres user>
PGHOST=<postgres host>
PGDATABASE=<postgres database>
PGPASSWORD=<postgres password>
PGPORT=<postgres password>

# it's used to hash the express-session with HMAC
SECRET=<secret> 
```
You can get openai api key in [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)

## Deploy

To deploy the website we followed [youtube tutorial](https://youtube.com/watch?v=oykl1Ih9pMg&t=4s) about how to build website using nginx technology
## Contributors

[Amanzhol Bakhtiyar](https://github.com/xamss),
[AbylaiNur](https://github.com/AbylaiNur)
