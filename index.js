import express from "express"
import cors from "cors"
import dotenv from "dotenv";
import  { dirname } from "path"
import { responseHandler } from "./utils/response/responseHandler.js";
import { fileURLToPath } from "url";
import { dbConnection } from "./config/database.js";
import router from "./routes/index.js"
import passport from "passport";
import logger from "morgan";
import { userappPassportStategy } from "./config/userappPassportStategy.js";
import { adminPassportStategy } from "./config/adminappPassport.js";
import { googlePassportStatgy } from "./config/googlePassportStategy.js";
import session from "express-session"
const app = express();
dotenv.config({ path: '.env' });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
global.__basedir = __dirname;


dbConnection();


const port = process.env.PORT || 8001;

app.use(responseHandler)
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize())
app.use(router)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

app.set('view engine','ejs')
app.set('views', __dirname, 'views');

userappPassportStategy(passport);
adminPassportStategy(passport)
googlePassportStatgy(passport);
app.get("/",(req,res) => {
  res.send('Hello from Quizer Backend!')
})

app.listen(port, () => {
  console.log(`your application is running on ${port}`);
});
