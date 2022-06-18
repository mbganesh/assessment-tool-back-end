import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import router from './router.js'
import adminRouter from "./adminRouter.js"



const app = express();

app.use(cors())

const port = 3002


//body-parser

app.use(express.json({ extended: false, limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: false, parameterLimit: 50000 }))


app.get("/",(req,res)=> {
    res.json("Router is working");
});

app.use('/api', router);
app.use('/admin', adminRouter);




// db server creation

mongoose.connect("mongodb://localhost:27017/assessmentToolDB", (err) => {
    if (err) {
      console.log("db not connect");
    }
    console.log("!!! Please Check S3 Bucket !!!")
    console.log("Mongo DB Connected");
  });


app.listen(port, () => console.log("Backend Running..."))
