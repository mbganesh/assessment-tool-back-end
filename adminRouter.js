import "dotenv/config";
import express from "express";

import generateUniqueId from "generate-unique-id";
import adminCredentialSchema from "./schema/adminSchemas/adminCredentialSchema.js";
import studentsDetailsSchema from "./schema/adminSchemas/studentsDetailsSchema.js";

import JSONData from "./JSONData.js";

import randomcolor from "randomcolor";
import jwt from "jsonwebtoken";
import registerSchema from "./schema/registerSchema.js";
import moment from "moment";

import mongoose from "mongoose";

const adminRouter = express.Router();
adminRouter.use(express.json());

// Creating Default Username/Password for Admin Credentials

let adminCredentialsCreate = async (req, res) => {
  let loginData = [
    { username: "admin", password: "123" },
    { username: "user", password: "321" },
  ];
  let findLogin = await adminCredentialSchema.find({}).lean();
  for (let i in loginData) {
    if (findLogin.length === 0) {
      let addLogin = await adminCredentialSchema.insertMany({
        username: loginData[i]["username"],
        password: loginData[i]["password"],
      });
    } else {
      return;
    }
  }
};

adminCredentialsCreate();

adminRouter.post("/firstJWTTutorial", async (req, res) => {
  console.log("firstJWTTutorial");

  return res.json({ success: true, message: "firstJWTTutorial" });
});

adminRouter.post("/addStudents", async (req, res) => {
  try {
    var requestData = req.body;

    let tokenData = TokenVerify(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }

    let collectionName =
      tokenData.profileData.email.split("@")[0] +
      tokenData.profileData.mobno +
      "StudentCol";

    // create schema
    var mySchema = studentsDetailsSchema;
    // create model
    var studentModal =
      mongoose.models[collectionName] ||
      mongoose.model(collectionName, mySchema, collectionName);

    var checkModel = await studentModal.find({});

    try {
      const stu_id =
        "stu-" + generateUniqueId({ length: 6, useLetters: false });
      requestData.studentData["studentID"] = stu_id;
      var data = requestData.studentData;

      requestData.studentData["studentColor"] = randomcolor({
        luminosity: "dark",
      });

      if (checkModel.length === 0) {
        let storeData = await studentModal.insertMany(data);
        return res.json({ success: true, message: "Data loaded successfully" });
      } else {
        var foundStudent = await studentModal.find({
          $or: [
            { studentMobNo: data.studentMobNo },
            { studentMail: data.studentMail },
          ],
        });

        if (foundStudent.length === 0) {
          let storeData = await studentModal.insertMany(data);
          return res.json({
            success: true,
            message: "Data loaded successfully",
          });
        } else {
          return res.json({
            success: false,
            message: "EmailID/PhoneNumber is already exist",
          });
        }
      }

      // return res.json({ success: true, message: "Data loaded successfully" });
    } catch (error) {
      return res.json({ success: false, message: "Data failed to load" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error });
  }
});


// updateStudent
adminRouter.post('/updateStudent' , async(req , res) => {

  try {
    let tokenData = TokenVerify(req.headers.authorization);
    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }

    let collectionName =
      tokenData.profileData.email.split("@")[0] +
      tokenData.profileData.mobno +
      "StudentCol";

    var studentModal =
      mongoose.models[collectionName] ||
      mongoose.model(collectionName, studentsDetailsSchema, collectionName);



      
  } catch (error) {
    return res.json({success:false , message:'Server Down'})
  }

})

// getAllStudents
adminRouter.post("/getAllStudents", async (req, res) => {
  var requestData = req.body;

  try {
    let tokenData = TokenVerify(req.headers.authorization);
    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }

    let collectionName =
      tokenData.profileData.email.split("@")[0] +
      tokenData.profileData.mobno +
      "StudentCol";

    var studentModal =
      mongoose.models[collectionName] ||
      mongoose.model(collectionName, studentsDetailsSchema, collectionName);

    var pageNo = req.body.pageNo;
    let size = req.body.pageSize;
    var result = 0;
    for (let i = 1; i <= pageNo; i++) {
      result = i * size;
    }

    const searchFilter = requestData.searchQuery !== "" ? { 'studentName': { $regex: requestData.searchQuery, $options: "i"  }} : {}

    var totalStudentCount = await studentModal.find(searchFilter, { _id: 0, __v: 0 }).count();

    console.log({totalStudentCount});

    var skips = totalStudentCount - result;
    if (skips <= 0) {
      size = size + skips;
      skips = 0;
    }

    console.log(searchFilter);

    var allStudentData = await studentModal
      .find(searchFilter, { _id: 0, __v: 0 })
      .skip(skips)
      .limit(size)
      .lean();

    return res.json({
      success: true,
      data: allStudentData,
      allStudentCount: totalStudentCount,
    });
  } catch (error) {
    return res.json({ success: false, message: "Catch Error" });
  }
});

// register
adminRouter.post("/register", async (req, res) => {
  let data = req.body;

  var foundUser = await registerSchema.find({
    $or: [{ mobno: data.mobno }, { email: data.email }],
  });

  try {
    if (foundUser.length === 0) {
      data["color"] = randomcolor({ luminosity: "dark" });
      data["lastLogin"] = moment().format("MMMM Do YYYY, h:mm:ss a");
      await registerSchema.insertMany(data);
      res.json({ success: true, message: "Registration Successfull" });
    } else {
      res.json({
        success: false,
        message: "Email or Mobile Number already exist",
      });
    }
  } catch (error) {
    res.json({ success: false, message: "ERR" });
  }
});

// login
adminRouter.post("/login", async (req, res) => {
  var requestData = req.body;

  let isEmail = requestData.username.split("").includes("@");

  const emailFilter = {
    email: requestData.username,
    password: requestData.password,
  };

  const mobnoFilter = {
    mobno: requestData.username,
    password: requestData.password,
  };

  try {
    let foundUser = await registerSchema.find(
      isEmail ? emailFilter : mobnoFilter
    );

    if (foundUser.length === 0) {
      return res.json({
        success: false,
        message: "Invalid Email/Mobile Number & password",
      });
    } else {
      const newFilter = isEmail ? emailFilter : mobnoFilter;
      const update = { lastLogin: moment().format("MMMM Do YYYY, h:mm:ss a") };

      await registerSchema.findOneAndUpdate(newFilter, update, { new: true });

      let profileData = await registerSchema.findOne(newFilter, {
        password: 0,
        _id: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      });

      let token = jwt.sign({ profileData }, process.env.JWT_PASSWORD, {
        expiresIn: "2h",
      });
      res.json({ success: true, message: token });
    }
  } catch (error) {
    res.json({
      success: false,
      message: "Invalid Email/Mobile Number & password",
    });
  }
});

adminRouter.get("/apiCheck", async (req, res) => {
  return res.json({ success: "true", message: "API Running" });
});

// Temp_Verify
adminRouter.get("/verify/:verify", async (req, res) => {
  var myToken = req.params.verify;

  try {
    var data = jwt.verify(myToken, process.env.JWT_PASSWORD);
    res.json(data);
  } catch (error) {
    res.json({ error });
  }
});

// verify
function TokenVerify(token) {
  try {
    var data = jwt.verify(token, process.env.JWT_PASSWORD);
    return data;
  } catch (error) {
    return "";
  }
}

export default adminRouter;

/**
 * 
 *   try {
    var pageNo = req.body.page;
    let size = req.body.size;
    var result2 = 0;
    for (let i = 1; i <= pageNo; i++) {
      result2 = i * size;
    }
    var totalStudentCount = await studentsDetailsSchema.count();
    var skips = totalStudentCount - result2;
    if (skips <= 0) {
      size = size + skips;
      skips = 0;
    }
    var results = [];
    if (req.body.searchQuery === "") {
      results = await studentsDetailsSchema
        .find({}, { _id: 0, __v: 0 })
        .limit(size)
        .skip(skips)
        .lean();
    } else if (req.body.searchQuery !== "") {
      console.log(req.body);
      var fieldName = req.body.field;
      var searchValue = "\\b" + req.body.searchQuery + "[a-zA-Z0-9]*";
      console.log(searchValue);

      if (pageNo > 1) {
        var newSkips = 0;
        newSkips = (pageNo - 1) * size;

        console.log(newSkips);

        results = await studentsDetailsSchema
          .find({ [fieldName]: { $regex: searchValue, $options: "i" } })
          .limit(size)
          .skip(newSkips)
          .lean();
      } else {
        results = await studentsDetailsSchema
          .find({ [fieldName]: { $regex: searchValue, $options: "i" } })
          .limit(size)
          .lean();
      }
      totalStudentCount = (
        await studentsDetailsSchema
          .find({ [fieldName]: { $regex: searchValue, $options: "i" } })
          .lean()
      ).length;
    }
  } catch (e) {
    return res.json({ success: "catchfalse", message: [] });
  }
 */



  // getStudentUpdated
  /**
   * adminRouter.post("/getAllStudents", async (req, res) => {
  var requestData = req.body;

  try {
    let tokenData = TokenVerify(req.headers.authorization);
    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }

    let collectionName =
      tokenData.profileData.email.split("@")[0] +
      tokenData.profileData.mobno +
      "StudentCol";

    var studentModal =
      mongoose.models[collectionName] ||
      mongoose.model(collectionName, studentsDetailsSchema, collectionName);

    var pageNo = req.body.pageNo;
    let size = req.body.pageSize;
    var result = 0;
    for (let i = 1; i <= pageNo; i++) {
      result = i * size;
    }
    var totalStudentCount = await studentModal.count();
    var skips = totalStudentCount - result;
    if (skips <= 0) {
      size = size + skips;
      skips = 0;
    }

    // const searchFilter = requestData.searchQuery !== "" ? { 'studentID': { $regex: requestData.searchQuery, $options: "i"  }} : {}

    const searchFilter = {studentID:"stu-728369"}

    console.log(searchFilter);

    var allStudentData = await studentModal
      .find(searchFilter, { _id: 0, __v: 0 })
      .skip(skips)
      .limit(size)
      .lean();

    return res.json({
      success: true,
      data: allStudentData,
      allStudentCount: totalStudentCount,
    });
  } catch (error) {
    return res.json({ success: false, message: "Catch Error" });
  }
});
   */



// 

/**
 * குண்டு குண்டு மாம்பழம்
 * மாம்பழம் 
 * 
 * 
 * அணில்
 * அணிலே அணிலே ஓடி வா
 * 
 */