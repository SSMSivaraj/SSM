import express from "express"
import cors from "cors"
import configRoutes from "./routes/configuration.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use('/config', configRoutes)

app.listen(5000, () => console.log("API running on 5000"))
