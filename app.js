const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

app.use(express.json())



const db = new sqlite3.Database('userData.db', (err) => {
    if (err){
        console.error('Error connecting to database:', err.message)
    } else {
        console.log('Connected to the userData.db database')
    } 
}) 


