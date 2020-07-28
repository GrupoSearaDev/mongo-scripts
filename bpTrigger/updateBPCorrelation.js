exports = async function(changeEvent) {

    var ss = require('simple-statistics')
    var moment = require('moment');
    moment().format();
    
   const employeeId = changeEvent.fullDocument.employeeId.toString()
  
    if (changeEvent.fullDocument.rfid == "000000") {
      return
    }
    
    const mongodb = context.services.get("Cluster0");
    const bloodPressures = mongodb.db("CTi").collection("bloodpressures");
  
    var docCount = await bloodPressures.count({employeeId: BSON.ObjectId(employeeId)});
  
    if (docCount < 6 || docCount > 2000) {
      return
    }
  
  // var docCount = 6
    
  //   var doc = [
  //     {"__v":0,"_id":"5e3d566643e9790004dfa747","companyId":"5e34bdefcba6e3157a1f4383","companyName":"Gerdau_Sahagun_1","createdAt":"2020-01-07T12:21:58.212Z","diastolic":96,"systolic":106,"employeeId":"5e3d562043e9790004dfa744","equipmentId":"EA19L0081","error":0,"pulse":52},
  //     {"__v":0,"_id":"5e3d566643e9790004dfa747","companyId":"5e34bdefcba6e3157a1f4383","companyName":"Gerdau_Sahagun_1","createdAt":"2020-01-17T12:21:58.212Z","diastolic":86,"systolic":120,"employeeId":"5e3d562043e9790004dfa744","equipmentId":"EA19L0081","error":0,"pulse":56},
  //     {"__v":0,"_id":"5e3d566643e9790004dfa747","companyId":"5e34bdefcba6e3157a1f4383","companyName":"Gerdau_Sahagun_1","createdAt":"2020-01-23T12:21:58.212Z","diastolic":76,"systolic":135,"employeeId":"5e3d562043e9790004dfa744","equipmentId":"EA19L0081","error":0,"pulse":62},
  //     {"__v":0,"_id":"5e3d566643e9790004dfa747","companyId":"5e34bdefcba6e3157a1f4383","companyName":"Gerdau_Sahagun_1","createdAt":"2020-02-03T12:21:58.212Z","diastolic":98,"systolic":110,"employeeId":"5e3d562043e9790004dfa744","equipmentId":"EA19L0081","error":0,"pulse":72},
  //     {"__v":0,"_id":"5e3d566643e9790004dfa747","companyId":"5e34bdefcba6e3157a1f4383","companyName":"Gerdau_Sahagun_1","createdAt":"2020-02-05T12:21:58.212Z","diastolic":91,"systolic":120,"employeeId":"5e3d562043e9790004dfa744","equipmentId":"EA19L0081","error":0,"pulse":89},
  //     {"__v":0,"_id":"5e3d566643e9790004dfa747","companyId":"5e34bdefcba6e3157a1f4383","companyName":"Gerdau_Sahagun_1","createdAt":"2020-02-10T12:21:58.212Z","diastolic":93,"systolic":122,"employeeId":"5e3d562043e9790004dfa744","equipmentId":"EA19L0081","error":0,"pulse":55},
  // ]
  
    var doc = await bloodPressures.find({employeeId: BSON.ObjectId(employeeId)}).sort( { createdAt: 1 } ).toArray();
    
    // console.log(doc)
  
    function getDaysDiff(start, end) {
      var a = moment(start);
      var b = moment(end);
      return b.diff(a, 'days')
    }
    
    let dateSysArray = []
    let sysArray = []
  
    let dateDiaArray = []
    let diaArray = []
  
    let datePulArray = []
    let pulArray = []
  
    let daysDiffArray = []
    let initialDate = doc[0].createdAt
    let finalDate = doc[doc.length - 1].createdAt
  
    let ahaNormalCount = 0
    let ahaElevatedCount = 0
    let ahaHBP1Count = 0
    let ahaHBP2Count = 0
    let ahaHypertensiveCrisisCount = 0
  
    let eshOptimalCount = 0
    let eshNormalCount = 0
    let eshHighNormalCount = 0
    let eshG1Count = 0
    let eshG2Count = 0
    let eshG3Count = 0
    let eshIshCount = 0
  
    let jnc7NormalCount = 0
    let jnc7PrehypertensionCount = 0
    let jnc7S1HCount = 0
    let jnc7S2HCount = 0
  
    doc.forEach(item => {
      var daysDiff = getDaysDiff(initialDate, item.createdAt)
  
      var dateSys = [daysDiff, item.systolic]
      var dateDia = [daysDiff, item.diastolic]
      var datePul = [daysDiff, item.pulse]
  
      sysArray.push(item.systolic)
      diaArray.push(item.diastolic)
      pulArray.push(item.pulse)
  
      daysDiffArray.push(daysDiff)
  
      dateSysArray.push(dateSys)
      dateDiaArray.push(dateDia)
      datePulArray.push(datePul)
  
      // // AHA Triage Count
      // if (item.systolic < 120 && item.diastolic < 80) {
      //   ahaNormalCount++
      //   eshOptimalCount++
      //   jnc7NormalCount++
      // } else if ((item.systolic >= 120 || item.systolic <= 129) || item.diastolic < 80) {
      //   ahaElevatedCount++
      // } else if ((item.systolic >= 130 || item.systolic <= 139) || (item.diastolic >= 80 || item.diastolic <= 89)) {
      //   ahaHBP1Count++
      // } else if ((item.systolic >= 140 || item.systolic <= 180) || (item.diastolic >= 90 || item.diastolic <= 120)) {
      //   ahaHBP2Count++
      // } else if (item.systolic > 180 || item.diastolic < 120) {
      //   ahaHypertensiveCrisisCount++
      // }
  
      // // ESH Triage Count
      // if ((item.systolic >= 120 || item.systolic <= 129) || (item.diastolic >= 80 || item.diastolic <= 84)) {
      //   eshNormalCount++
      // } else if ((item.systolic >= 130 || item.systolic <= 139) || (item.diastolic >= 85 || item.diastolic <= 89)) {
      //   eshHighNormalCount++
      // } else if ((item.systolic >= 140 || item.systolic <= 159) || (item.diastolic >= 90 || item.diastolic <= 99)) {
      //   eshG1Count++
      // } else if ((item.systolic >= 160 || item.systolic <= 179) || (item.diastolic >= 100 || item.diastolic <= 109)) {
      //   eshG2Count++
      // } else if (item.systolic >= 180 || item.diastolic >= 110) {
      //   eshG3Count++
      // } else if (item.systolic >= 140 && item.diastolic < 90) {
      //   eshIshCount++
      // }
  
      // // JNC7 Triage Count
      // if ((item.systolic >= 120 || item.systolic <= 139) || (item.diastolic >= 80 || item.diastolic <= 89)) {
      //   jnc7PrehypertensionCount++
      // } else if ((item.systolic >= 140 || item.systolic <= 159) || (item.diastolic >= 90 || item.diastolic <= 99)) {
      //   jnc7S1HCount++
      // } else if (item.systolic >= 160 && item.diastolic >= 100) {
      //   jnc7S2HCount++
      // }
    })
  
    let maxSys = ss.max(sysArray)
    let maxDia = ss.max(diaArray)
    let maxPul = ss.max(pulArray)
  
    let minSys = ss.min(sysArray)
    let minDia = ss.min(diaArray)
    let minPul = ss.min(pulArray)
  
    let meanSys = parseInt(ss.mean(sysArray).toFixed());
    let meanDia = parseInt(ss.mean(diaArray).toFixed());
    let meanPul = parseInt(ss.mean(pulArray).toFixed());
  
    let medianSys = parseInt(ss.median(sysArray).toFixed());
    let medianDia = parseInt(ss.median(diaArray).toFixed());
    let medianPul = parseInt(ss.median(pulArray).toFixed());
  
    let sysCorrelation = parseFloat(ss.sampleCorrelation(daysDiffArray, sysArray).toFixed(2));
    let diaCorrelation = parseFloat(ss.sampleCorrelation(daysDiffArray, diaArray).toFixed(2));
    let pulCorrelation = parseFloat(ss.sampleCorrelation(daysDiffArray, pulArray).toFixed(2));
  
    let sysOneYearPrediction = null
    let diaOneYearPrediction = null
    let pulOneYearPrediction = null
  
    // // if (docCount >= 3 && getDaysDiff(initialDate, finalDate) >= 5) {
    // if (docCount > 35 && getDaysDiff(initialDate, finalDate) > 91) {
    //   let sysLinearRegression = ss.linearRegression(dateSysArray)
    //   let diaLinearRegression = ss.linearRegression(dateDiaArray)
    //   let pulLinearRegression = ss.linearRegression(datePulArray)
    
    //   let ls = ss.linearRegressionLine(sysLinearRegression);
    //   let ld = ss.linearRegressionLine(diaLinearRegression);
    //   let lp = ss.linearRegressionLine(pulLinearRegression);
      
    //   sysOneYearPrediction = parseInt(ls(dateSysArray[docCount - 1][0] + 365).toFixed());
    //   diaOneYearPrediction = parseInt(ld(dateDiaArray[docCount - 1][0] + 365).toFixed());
    //   pulOneYearPrediction = parseInt(lp(datePulArray[docCount - 1][0] + 365).toFixed());
    // }
  
    const employees = mongodb.db("CTi").collection("employees");
  
    var dataToSave = {
      ahaNormalCount,
      ahaElevatedCount,
      ahaHBP1Count,
      ahaHBP2Count,
      ahaHypertensiveCrisisCount,
      eshOptimalCount,
      eshNormalCount,
      eshHighNormalCount,
      eshG1Count,
      eshG2Count,
      eshG3Count,
      eshIshCount,
      jnc7NormalCount,
      jnc7PrehypertensionCount,
      jnc7S1HCount,
      jnc7S2HCount,
      sysOneYearPrediction,
      diaOneYearPrediction,
      pulOneYearPrediction,
    }
  
    for (const property in dataToSave) {
      if (dataToSave[property] == 0 || dataToSave[property] == null) {
        delete dataToSave[property]
      }
    } 
  
    var updatedEmployee = await employees.updateOne({_id: BSON.ObjectId(employeeId)}, {
      $set: {
        ...dataToSave,
        maxSystolic: maxSys,
        maxDiastolic: maxDia,
        maxPulse: maxPul,
        minSystolic: minSys,
        minDiastolic: minDia,
        minPulse: minPul,
        meanSystolic: meanSys,
        meanDiastolic: meanDia,
        meanPulse: meanPul,
        medianSystolic: medianSys,
        medianDiastolic: medianDia,
        medianPulse: medianPul,
        sysCorrelation,
        diaCorrelation,
        pulCorrelation,
        bpMeasurementsCount: docCount,
        lastMeasurementDate: new Date(moment(finalDate).toISOString())
        // lastMeasurementDate: new Date(moment(finalDate))
      }
    })
  
    console.log(employeeId)
    console.log(JSON.stringify(updatedEmployee))
    
    return {changeEvent: changeEvent};
  };