import mongoose from "mongoose"

const adminCredentialSchema = new mongoose.Schema({
    username: String,
    password:String
})

const adminCredential =mongoose.model("adminCredential",adminCredentialSchema);

export default adminCredential 