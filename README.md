# Domain Availability Checker

For checking availability of domain in [GoDaddy](https://godaddy.com) using [selenium](https://selenium.dev/) based on your own wordlist

## Getting Started

Are you tired checking domain availability one by one ? You come in right place. This app will allow you to check domain based on your wordlist. Read following guide to setup your app.

### Prerequisites

Make sure latest [NodeJS](https://nodejs.org/) is installed

### Config

Take a look at `config.js`. There is all config for this app

- show_browser : set `true` for showing browser window, set to `false` for headless browser
- show_log: set `true` for showing log in console
- timeout: timeout for waiting result or waiting loading page (in milisecond)
- tld: add your TLD that will be checked

### Installing

- Clone this repo
- Run `npm install` to installing all dependencies
- Add your word list into `wordlist.txt`
- Run `node index.js`
