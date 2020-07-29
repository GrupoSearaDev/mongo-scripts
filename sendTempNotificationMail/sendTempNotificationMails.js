exports = async function(changeEvent) {
  const {fullDocument} = changeEvent;
  const {temperature, rfid, equipmentId} = fullDocument;
  
  if(temperature >= 37.5){
    const mongodb = context.services.get("Cluster0");
    const companyMail = mongodb.db("CTi").collection("companies");
    const employeeMail = mongodb.db("CTi").collection("employees");
    
    const companyId = changeEvent.fullDocument.companyId.toString();
    const employeeId = changeEvent.fullDocument.employeeId.toString();
    
    var match = await companyMail.findOne({ _id: BSON.ObjectId(companyId) });
    var matchEmployee =  await employeeMail.findOne({ _id: BSON.ObjectId(employeeId) })
  
    const { notificationTempEmails, reportTempEmails } = match;
    
    const emailData = {
      employeeFullName: matchEmployee.fullName,
      companyEmployeeId: matchEmployee.companyEmployeeId,
      outsourcedEmployee: matchEmployee.outsourcedEmployee,
    }

    const ses = context.services.get('temp_notifications').ses("us-east-1");

      const BCCmails = ["1664859gustavonajera@gmail.com", "operaciones@gruposeara.com",  "ces@gruposeara.com", "eduardo@grupooseara.com"];

      var ses_mail = "From: Notificaciones Cardiotrack <seara.health@gmail.com>\n";
      ses_mail += "To: " + notificationTempEmails + "\n";
      ses_mail += "Bcc: " + BCCmails + "\n";
      ses_mail += "Subject: " + match.name + ": Se ha detectado una Temperatura Alta de " + temperature+ " °C \n";
      ses_mail += "MIME-Version: 1.0\n";
      ses_mail += "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
      ses_mail += "--NextPart\n";
      ses_mail += "Content-Type: text/html\n\n";
      ses_mail += `El empleado <strong>${emailData.employeeFullName}</strong> ha sido registrado con una temperatura `;
      ses_mail += `de <strong>${temperature}°C</strong> que puede ser un indicio de Fiebre. <br />`;
      ses_mail += `  Los Datos del empleado son:  <br />`;
      ses_mail += `&nbsp; <strong>Nombre de Empresa:</strong> ${match.name}, <strong>RFID:</strong> ${rfid}, <br />`;
      ses_mail += `&nbsp; ID de Empleado: ${emailData.companyEmployeeId},  Empleado Externo: ${emailData.outsourcedEmployee},   ID de Equipo: ${equipmentId},<br />`;
      ses_mail += `Fecha del Registro: ${Date().slice(0,16)}`;
      ses_mail += "\n\n";
      ses_mail += "--NextPart--";
    
      const result = ses.SendRawEmail({
        Source: "seara.health@gmail.com",
        RawMessage: { Data: ses_mail }
      });

    console.log("Email sent... ??")
    return result;
    
  }
}
