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
    
    function text(){
      return `El empleado <strong>${emailData.employeeFullName}</strong> ha sido registrado con una temperatura de <strong>${temperature}°C</strong> que puede ser un indicio de Fiebre. <br />
        Los Datos del empleado son:  <br />
     &nbsp; <strong>Nombre de Empresa:</strong> ${match.name}, <strong>RFID:</strong> ${rfid}, <br />
     &nbsp; ID de Empleado: ${emailData.companyEmployeeId},  Empleado Externo: ${emailData.outsourcedEmployee},   ID de Equipo: ${equipmentId},<br />
     Fecha del Registro: ${Date().slice(0,16)}`;
    }
     
      const mails = ["1664859gustavonajera@gmail.com", "operaciones@gruposeara.com",  "ces@gruposeara.com", "eduardo@grupooseara.com"];
      const ses = context.services.get('temp_notifications').ses("us-east-1");
      
      const result = await ses.SendEmail({
        Source: "seara.health@gmail.com",
        Destination: { BccAddresses: [...mails], ToAddresses:[...notificationTempEmails] },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: text()
            }
          },
          Subject: {
            Charset: "UTF-8",
            Data: `${match.name}: Se ha detectado una Temperatura Alta de ${temperature}°C`
          }
        }
      });
      console.log(JSON.stringify(result));
      console.log(text())
      console.log("Email sent... ??")
      
      return result;
    }
  }
  