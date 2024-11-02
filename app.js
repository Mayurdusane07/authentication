const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'userData.db')

let db = null

initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
  }
}

initializeDBAndServer()

app.get('/users', async (request, response) => {
  const getUsers = `
  SELECT * FROM user 
  `
  const res = await db.all(getUsers)
  response.send(res)
  console.log(true)
})

// API to register the user
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body

  const hashedPass = await bcrypt.hash(password, 10)

  const dbUserQuery = `
  SELECT * FROM user 
  WHERE username = '${username}'   
  `
  const dbUser = await db.get(dbUserQuery)

  console.log(dbUser === undefined)
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const createUser = `
    INSERT INTO user (username, name, password, gender, location)
    VALUES 
    ('${username}', '${name}', '${hashedPass}', '${gender}', '${location}')
    `
      await db.run(createUser)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

// API to login user

app.post('/login', async (request, response) => {
  const {username, password} = request.body

  const getUserQuery = `
  SELECT * FROM user 
  WHERE username = '${username}' 
  `
  dbUser = await db.get(getUserQuery)

  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)

    if (isPasswordMatched === true) {
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

// update user
app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body

  const getUserQuery = `
  SELECT *
  FROM user 
  WHERE username = '${username}'
  `
  try {
    const dbUser = await db.get(getUserQuery)
    const currentPasswordMatch = await bcrypt.compare(
      oldPassword,
      dbUser.password,
    )

    if (currentPasswordMatch === true) {
      if (newPassword.length < 5) {
        response.status(400)
        response.send('Password is too short')
      } else { 
        const hashedNewPass = await bcrypt.hash(newPassword, 10) 
        const updateQuery = `
        UPDATE user 
        SET 
        password = '${hashedNewPass}' 
        WHERE username = '${username}';
        ` 
        await db.run(updateQuery)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  } catch (e) {
    console.log(`Update Error : ${e.message}`)
  }
}) 


module.exports = app 
