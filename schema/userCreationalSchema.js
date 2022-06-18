import mongoose from "mongoose"

const userCreationalSchema = new mongoose.Schema({
    username: String,
    password:String
})

const userCreational =mongoose.model("userCreational",userCreationalSchema);

export default userCreational 