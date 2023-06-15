import express, { json } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import groupsRouter from './groups/groups.router.js';
import usersRouter from './users/users.router.js';
import { checkToken } from './users/users.middleware.js'
import { ErrorResponse } from './error.js'



dotenv.config();
const app = express();

(async function () {
    try {
        if (process.env.DB_SERVER_URL) {
            await mongoose.connect(process.env.DB_SERVER_URL)
            console.log(`DB server connected successfully`)
        } else {
            throw new Error(`DB Server URL not found`)
        }
    } catch (error) {
        console.log(error)
        process.exit(0)
    }
})()


app.use(cors())
app.use(morgan('dev'))
app.use(json())
// serving all reciept images
app.use('/receipts', express.static(path.join(fileURLToPath(new URL('.', import.meta.url)), 'uploads')))


// routes
app.use('/groups', checkToken, groupsRouter)
app.use('/users', usersRouter)

// Catch all unhandled requests
app.all('*', async (req, res, next) => next(new ErrorResponse(`Route not found`, 404)))

// error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({ success: false, data: error.message })
})

app.listen(3000, () => console.log(`Server is listening on 3000`))