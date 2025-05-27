import dotenv from "dotenv"
import dbConnect from "./db/index.js"
import {app} from "./app.js"
dotenv.config({
    path:'./env'
})
const PORT = process.env.PORT || 8000;
dbConnect()
.then(()=>{
    app.listen(PORT, '0.0.0.0', ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!! ", err);
})