exports = async function() {
  const papa = require("papaparse");
  const moment = require("moment-timezone");
  const mongodb = context.services.get("Cluster0");
  const companies = mongodb.db("CTi").collection("companies");
  const temps = mongodb.db("CTi").collection("alertsigns");
  
  const SOURCE_EMAIL = "seara.health@gmail.com";
   
  const allCompanies = await companies.find({reportTempEmails:{$exists:true}},{_id:1, name:1, reportTempEmails:1}).toArray();
  
  var newCompanies = {};
  
  var x = 1;
  allCompanies.map(function(ell){
    if(ell.reportTempEmails.length !==0){
      newCompanies[ell.name] = { id: ell._id.toString(), reportTempEmails: ell.reportTempEmails}
    }
  });
  
  const ses = context.services.get('temp_notifications').ses("us-east-1");
  const companyValues = Object.keys(newCompanies);
    
  companyValues.forEach( async function(name){
    const {reportTempEmails, id} = newCompanies[name];
    const today = new Date().getTime();
    const date = today - 86400000;
    const yesterday = new Date(date);
    const dayCut = yesterday.toISOString().slice(0,10);

    const toCSV = await temps.find({ companyId:BSON.ObjectId(id), createdAt:{ $gte: yesterday } }, {__v:0}).toArray();
    const newtoCSV = toCSV.map(function(doc){
      const newCreate = moment.tz( doc.createdAt, 'America/Mexico_City');
      const newUpdate= moment.tz( doc.updatedAt, 'America/Mexico_City');
      return {...doc, createdAt: newCreate, updatedAt: newUpdate }
    })
    
    const CSV = papa.unparse(newtoCSV);
    
    const BCCmails = ["operaciones@gruposeara.com", "ces@gruposeara.com", "eduardo@grupooseara.com", "1664859gustavonajera@gmail.com"];
    
    var ses_mail = "From: Reporte Diario Cardiotrack - Temperatura  <" + SOURCE_EMAIL + ">\n";
    ses_mail += "To: " + reportTempEmails + "\n";
    ses_mail += "Bcc: " + BCCmails + "\n";
    ses_mail += "Subject: " + name + ": Reporte de Lecturas de Temperatura, " + dayCut + "\n";
    ses_mail += "MIME-Version: 1.0\n";
    ses_mail += "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
    ses_mail += "--NextPart\n";
    ses_mail += "Content-Type: text/html\n\n";
    ses_mail += "Reporte Diario.\n\n";
    ses_mail += "--NextPart\n";
    ses_mail += `Content-Type: text/csv; charset=us-ascii; name=\"tempReport${dayCut}.csv\"\n`;
    ses_mail += `Content-Description: tempReport${dayCut}.csv`;
    ses_mail += "Content-Transfer-Encoding: base64\n";
    ses_mail += "Content-Disposition: attachment\n\n";
    ses_mail += CSV + "\n\n";
    ses_mail += "--NextPart--";
      
     
    if(toCSV.length !== 0){
      const result = ses.SendRawEmail({
        Source: "seara.health@gmail.com",
        RawMessage: { Data: ses_mail }
      });
    }
  
  });
}
