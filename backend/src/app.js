import express from "express";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js"
import cors from "cors";


const app = express();

//this middelware helps to extract the json data from the body 
app.use(express.json());


app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

/**
 * - /api/auth: routes to authentic 
 * - /api/message: to get the messsage and send or receive more message 
 */
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);



// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//     });
//   }

export default app;