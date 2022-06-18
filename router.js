import express from "express";
import userCreationalSchema from "./schema/userCreationalSchema.js";

import JSONData from "./JSONData.js";


const router = express.Router();
router.use(express.json());



router.post("/login", async (req, res) => {
  console.log("login");
  let cdate = new Date();
  let currentyear = cdate.getUTCFullYear();
  let currentDate = cdate.toISOString();

  if (req.body.user === "admin") {

    // console.log(JSONData)

    let dateTime = "2022-06-03T06:00:36.019Z"

    console.log({dateTime})
    return res.json({ success: true, message: "Login Successfull215",questionData:JSONData, dateTimeToStartExam:dateTime, name:req.body.name });
  }
});


router.get("/apiCheck", async (req, res) => {
  return res.json({ success: "true", message: "API Running" });
});

export default router;
