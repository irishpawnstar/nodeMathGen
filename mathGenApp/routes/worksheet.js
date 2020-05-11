var express = require('express');
var session = require('express-session');
var router = express.Router();

const mathHelpers = require("../models/worksheetSession.js");
const mongoHelpers = require("../models/mongoSession.js");
const scoreHelpers = require("../models/scoresSession.js");

var renderFuncNoWorksheet = (request, response, worksheet) => { // render the worksheet
  console.log(worksheet);
  request.session.currentWorksheet = worksheet;
  user = request.session.currentUser;
  if (user.type == "Student") {
    if (worksheet.topic == "Quadratic") {
      response.render("quadraticWorksheet", worksheet);
    } else {
      response.render("studentWorksheet", worksheet);
    }
  } else {
    if (worksheet.topic == "Quadratic") {
      response.render("quadraticWorksheet", worksheet);
    } else {
      response.render("worksheet", worksheet);// render normal worksheet
    }
  }
};

var renderResultsFunc = (request, response, saveTheScore) => { // render results
  worksheetDetails = request.session.worksheetDetails
  user = request.session.currentUser;
  if (user.type == "Student") {
    if (saveTheScore == true) {
      workSheet = request.session.currentWorksheet;
      scoreHelpers.saveScore(workSheet.author, worksheetDetails.correctAnswerCount, worksheetDetails.name, user.userName);
      response.render("studentResults", worksheetDetails);
    } else {
      response.render("studentResults", worksheetDetails);
    }
  } else {
    if (saveTheScore == true) {
      workSheet = request.session.currentWorksheet;
      scoreHelpers.saveScore(workSheet.author, worksheetDetails.correctAnswerCount, worksheetDetails.name, user.userName);
      response.render("result", worksheetDetails);
    } else {
      response.render("result", worksheetDetails);
    }
  }
};

/* GET worksheet page. */
router.get('/worksheet', function (request, response, next) {
  try {
    if (request.session.worksheetLoaded == true) { // If worksheet has been loaded
      var workSheet = request.session.currentWorksheet;
      var answers = request.query;
      console.log("ANSWERS", answers);
      if (workSheet.topic == "Quadratic") {
        var worksheetDetails = mathHelpers.checkQuadraticAnswers(workSheet, answers);
      } else {
        var worksheetDetails = mathHelpers.checkAnswers(workSheet, answers);
      }
      console.log("Worksheet Details", worksheetDetails);
      request.session.worksheetDetails = worksheetDetails;
      user = request.session.currentUser;
      scoreHelpers.checkScore(request, response, workSheet.author, worksheetDetails.correctAnswerCount, worksheetDetails.name, user.userName, renderResultsFunc);
    }
    else { // If worksheet hasn't been loaded 
      request.session.worksheetLoaded = true;
      var workSheetID = request.query;
      console.log(workSheetID._id);
      mongoHelpers.findWorksheet(workSheetID, renderFuncNoWorksheet, request, response);
    }
  } catch (err) {
    response.render("error", { message: "Error", error: err });
  }
});
/* POST worksheet page. */
router.post('/worksheet', function (request, response, next) {
  try {
    request.session.worksheetLoaded = true;
    mongoHelpers.findWorksheetBySearch(request, response, request.body.teacher, request.body.worksheetName, renderFuncNoWorksheet);
  } catch (err) {
    response.render("error", { message: "Error", error: err });
  }
})

module.exports = router;