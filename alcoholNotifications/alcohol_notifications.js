exports = async function(changeEvent) {
    const { fullDocument } = changeEvent;
    const { rfid, elevatedBreathAlcoholLevel } = fullDocument;
    const companyId = fullDocument.companyId.toString();
    
    const mongo = context.services.get("Cluster0");
  
    //   const bps = mongo.db("CTi").collection("breathalcohols");
    //   const halfAndHourAgo = new Date().getTime() - (2100*1000);
      
        // const secondLecture = await bps.find({ 
        //   rfid: rfid, 
        //   companyId: BSON.ObjectId(companyId), 
        //   createdAt:{ $gte: new Date(halfAndHourAgo) }
        // }).toArray();
      
    //   const condition = secondLecture.some( function(e){
    //     return (e.systolic <= 89 || e.diastolic <= 59 || e.systolic >= 140 || e.diastolic >= 90)
    //   });
      
      const ses = context.services.get('temp_notifications').ses("us-east-1");
      
      if( elevatedBreathAlcoholLevel ){
      
        const companies = mongo.db("CTi").collection("companies");
        const currentCompany = await companies.findOne({ _id: BSON.ObjectId(companyId) }, {notificationEmails:1});
        const notificationEmails = currentCompany.notificationEmails;
        // console.log(JSON.stringify(notificationEmails))
        
        const employees = mongo.db("CTi").collection("employees");
        const currentEmployee = await employees.findOne({ rfid: rfid, companyId: BSON.ObjectId(companyId) });
        // console.log(JSON.stringify(currentEmployee))
        
        
        const BCCmails = ["1664859gustavonajera@gmail.com", "operaciones@gruposeara.com",  "ces@gruposeara.com", "eduardo@grupooseara.com"];
  
        var ses_mail = "From: Cardiotrack  <seara.health@gmail.com>\n";
        ses_mail += "To: " + notificationEmails + "\n";
        ses_mail += "Bcc: " + BCCmails + "\n";
        ses_mail += "Subject: " + currentEmployee.fullName + " tiene rastros de alcohol en su aliento." + "\n";
        ses_mail += "MIME-Version: 1.0\n";
        ses_mail += "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
        ses_mail += "--NextPart\n";
        ses_mail += "Content-Type: text/html\n\n";
        ses_mail += "<h3>Esta persona tiene alcohol en su aliento...</h3> <br>";
        ses_mail += `Empleado: ${currentEmployee.fullName}, CompanyName: ${currentEmployee.companyName}, CompanyEmployeeId: ${currentEmployee.companyEmployeeId} <br>`;
        ses_mail += `Rfid: ${rfid}, outsourcedEmployee: ${currentEmployee.outsourcedEmployee} <br>`;  
        ses_mail += `Sistólica: ${systolic}, Diastólica: ${diastolic}, Pulso: ${pulse}`;
        ses_mail += "\n\n";
        ses_mail += "--NextPart--";
        
        
        
        // if(systolic <= 89 || diastolic <= 59 || systolic >= 140 || diastolic >= 90){
          const result = ses.SendRawEmail({
            Source: "seara.health@gmail.com",
            RawMessage: { Data: ses_mail }
          });
        // };
        
        console.log(JSON.stringify(currentEmployee));
      };
  };