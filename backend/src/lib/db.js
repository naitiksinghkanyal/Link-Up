import mongoose from "mongoose";

export const connectToDB = async () => {
       await mongoose.connect(process.env.MONGO_URI)
            .then(()=> {
                console.log("Server is connected to DB. ")
            })
            .catch(err => {
                console.log("Error connecting to DB. ")
                process.exit(1)
            })
}

    






