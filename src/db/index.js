import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnect =async()=>{
    try {
       
        console.log('db connected succesfully')
    } catch (error) {
        console.log('Mongodb connection error',error)
        process.exit(1)
    }
}

export default dbConnect;