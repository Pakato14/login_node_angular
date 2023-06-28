const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const cookieParser = require('cookie-parser')

app = express()
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: ['http://localhost:4200', 'http://localhost:3000', 'http://localhost:8080']
}))
const port = 8000

routes(app)

app.listen(port, () => console.log(`O servidor está On na porta ${port}`))

module.exports = app