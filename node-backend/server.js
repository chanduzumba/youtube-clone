import express from 'express' //import express for creating a server
import dotenv from 'dotenv'
import morgan from 'morgan' //import morgan for logging HTTP requests
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import channelRoutes from './routes/channel.routes.js'
import videoRoutes from './routes/video.routes.js'
import commentRoutes from './routes/comment.routes.js'

//configure dot env for reading env variables
dotenv.config()
// create and listen at port 5000 from env file
const app = express()

//listen at port 5000
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server is running at port: ${port}`)
})

//middleware to parse incoming request bodies in JSON format
app.use(express.json());
app.use(morgan('dev')); //use morgan for logging HTTP requests
app.use(cors()) // use cors to allow cross-origin requests from frontend running on different port

//root route to check if server is running
app.get('/' , (req,res)=>{
    res.send("HELLO FROM ROOT ROUTE")
})

//routes for different functionality
//auth routes
app.use('/api/auth', authRoutes)
//channel routes
app.use('/api/channel', channelRoutes)
//video routes
app.use('/api/videos', videoRoutes)
//comment routes
app.use('/api/comments', commentRoutes)

//DB connection
connectDB()