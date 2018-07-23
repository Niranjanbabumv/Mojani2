var express = require('express');
var router = express.Router();
var vcapServices = require("vcap_services");
var Cloudant = require('@cloudant/cloudant');

var requestify = require('requestify'); 

var http = require('http');
var credentials = {};
if(process.env.VCAP_SERVICES){ //for bluemix env
credentials = vcapServices.getCredentials('cloudantNoSQLDB', null, 'cloudant_land_records'); //get the cloudant_land_records service instance credentials
console.log("credentials",credentials);
}


var cloudant_url = process.env.CLOUDANT_DB_URL || credentials.url;
var cloudant = Cloudant(cloudant_url);

//create the document in the db if not available
var mojaniDBName = process.env.MOJANI_DB || "mojani";

cloudant.db.create(mojaniDBName, function(err) {
        if (err) {
            console.log('Could not create new db: ' + mojaniDBName+ ', it might already exist.');
        }
});
//connect to MOJANI DB
var mojani = cloudant.use(mojaniDBName);
  
  //create index in db on ward no if not existing
  var ward = {name:'ward', type:'json', index:{fields:['wardNo']}};
mojani.index(ward, function(er, response) {
  if (er) {
console.log("Error creating index on ward no:"+ er);
  }else{
console.log('Index creation result on ward:'+ response.result);
  }
});
  //create index in db on ward no & Area code mix if not existing
  var area = {name:'area', type:'json', index:{fields:['wardNo','areaCode']}};
mojani.index(area, function(er, response) {
  if (er) {
console.log("Error creating index on area (wardNo+areaCode):"+ er);
  }else{
console.log('Index creation result on area (wardNo+areaCode):'+ response.result);
  }
});
  //create index in db on PID if not existing
  var pid = {name:'pid', type:'json', index:{fields:['pid']}};
mojani.index(pid, function(er, response) {
  if (er) {
console.log("Error creating index on pid:"+ er);
  }else{
console.log('Index creation result on pid:'+ response.result);
  }
});

/* POST API to create a new land record in MOJANI*/
router.post('/api/addLandRecordMojani', (req, res) => {
  console.log('Inside Express api to add new land record');
  console.log("Received PID: " + req.body.pid);
  var record = req.body;
  var id = req.body.pid;
    mojani.insert(record, id, function(err, doc) {
if (err) {
console.log("Error saving record to Mojani" +err);
res.json({success:false, message: err.toString()});
}else{
console.log("success inserting record to Mojani");
res.json({success : true, message : "Land record added successfully to Mojani"});
}
    }); 
});

/* POST API to update land record in MOJANI */
router.post('/api/updateLandRecordMojani', (req, res) => {
  console.log('Inside Express api to update new land record');
  console.log("Received ward no & area code: " + req.body.wardNo + "," + req.body.areaCode);
    mojani.find({selector:{pid:req.body.pid}}, function(er, result) {
  if (er) {
console.log("Error finding documents with Pid " + req.body.pid);
      res.json({success : false, message : err+""});
  }
console.log("Found documents with Pid " + req.body.pid + ": " +result.docs.length ); 

   var record = req.body; // land record to be updated
   record["_id"] = result.docs[0]["_id"];
   record["_rev"] = result.docs[0]["_rev"];  
if(result.docs[0]['_attachments'] !=null){
        record['_attachments'] = result.docs[0]['_attachments'];
}    
  mojani.insert(record,function(err, doc){
if (err) {
console.log("Error updating record to Mojani" +err);
res.json({success : false, message : err+""});
} else{
console.log("success updating record to Mojani");
        res.json({success : true, documentIdAdded : req.body.pid});
} 
}); 

}); 
});

/* POST API to update approved records in MOJANI*/
router.post('/api/updateMojaniApprovedStatus', (req, res) => {
  console.log('Inside Express api to update new land record');
  var records = req.body; //Array of land records
  console.log("list of documents" + JSON.stringify(records));
  var documentIdsAdded = [];
  mojani.find({selector:{wardNo:records[0].wardNo}}, function(er, result){
  if (er) {
console.log("Error finding documents :" + er);
res.json({success : false, message : err+""});
  }
console.log('Found documents with wardNo '+ records[0].wardNo +":"+ result.docs.length);
    console.log('documents with wardNo from mojani'+ records[0].wardNo +":"+ JSON.stringify(result.docs));
for (var i = 0; i < records.length; i++) {
for(var j=0; j < result.docs.length; j++){
if(records[i].pid == result.docs[j].pid){
records[i]["_id"] = result.docs[j]["_id"];
records[i]["_rev"] = result.docs[j]["_rev"];
  if(result.docs[j]['_attachments'] !=null){
                      records[i]['_attachments'] = result.docs[j]['_attachments'];
}
if(records[i].isMojaniApproved){ //only approved records to be put into blockchain 
console.log('calling block chain code'); 
             var assigneeReq = {
                     "$class": "org.bhoomi.landrecords.AddAssignee",
                     "owner" : {
                        "$class": "org.bhoomi.landrecords.Owner",
                        "aadharNo": result.docs[j].ownerDetails.aadharNo+"",
                        "ownerName": result.docs[j].ownerDetails.ownerName+"",
                        "gender": result.docs[j].ownerDetails.gender+"",
                        "mobileNo": result.docs[j].ownerDetails.mobileNo+"",
                        "emailID": result.docs[j].ownerDetails.emailID+"",
                        "address": result.docs[j].ownerDetails.address+"" 
}
}
console.log("Owner request body :" +JSON.stringify(assigneeReq));

requestify.request(http://13.232.73.187:3000/api/AddAssignee', {
method: 'POST',
body: assigneeReq ,
dataType: 'json' 
})
.then(function(response) {
// get the code
var statusCode = response.getCode();  
    console.log("Update land record Fabric Response code : " + code);
console.log(response.getBody());
              
});
requestify.request('http://13.232.73.187:3000/api/AddLandRecord', 
    {
method: 'POST',
body: {
  "$class": "org.bhoomi.landrecords.AddLandRecord",
  "landrecord": {
"$class": "org.bhoomi.landrecords.LandRecord",
"pid": result.docs[j].pid+"",
"wardNo": result.docs[j].wardNo+"",
"areaCode": result.docs[j].areaCode+"",
"siteNo": result.docs[j].siteNo+"",
"txnId": "NA",
"timeStamp":  new Date()+"",
"isMojaniApproved": true,
"isKaveriApproved": false,
"latitude": result.docs[j].geoData.latitude+"",
"longitude": result.docs[j].geoData.longitude+"",
"length": result.docs[j].geoData.length+"",
"width": result.docs[j].geoData.width+"",
"totalArea": result.docs[j].geoData.totalArea+"",
"address": result.docs[j].geoData.address+"",
"owner": "resource:org.bhoomi.landrecords.Owner#"+result.docs[j].ownerDetails.aadharNo
  }
},
dataType: 'json'
}
)
.then(function(response) {
// get the code
var code = response.getCode();  
console.log("Update land record OWNER Fabric Response code : " + code);
console.log(response.getBody());
});
console.log("Document matched ",result.docs[j].pid);
documentIdsAdded.push(result.docs[j].pid);
break;
}
}
} 
}

mojani.bulk({docs : records}, function(err, doc) {
if (err) {
console.log("Error in updating records to Mojani" +err);
res.json({success : false, message : err+""});
} else{
console.log("success BULK saving records to Mojani");
       res.json({success : true, documentIdsAdded : documentIdsAdded});
} 
}); 

}); 
});


/* GET API to get land records from MOJANI using ward No*/
router.get('/api/getLandRecordsMojaniByWard/:wardNo', (req, res) => {
  console.log('Inside Express api to get land records by Ward No');
mojani.find({selector:{wardNo:req.params.wardNo}}, function(er, result) {
  if (er) {
console.log("Error finding documents :" + er);
res.json({success : false,message:"Error finding documents :"+er,landRecords:null});
  }
  console.log('Found documents with wardNo count: '+ req.params.wardNo +":"+ result.docs.length);
  var filteredRecords;
    if(result.docs!=null){
filteredRecords= result.docs.filter(record => record.isMojaniSubmitted && !record.isMojaniApproved && !record.isMojaniRejected);
}
  console.log('Filtered documents with wardNo Approved count: '+ req.params.wardNo +":"+ result.docs.length);
  res.json({success : true, message:"Found "+result.docs.length+" documents", landRecords:filteredRecords});
});
});

/* GET API to get land records from MOJANI using PID*/
router.get('/api/getLandRecordsMojaniByPid/:id', (req, res) => {
  let sketchURL;
  console.log('Inside Express api to get land records by Pid');
  if(!isNaN(req.params.id)){
mojani.find({selector:{pid:Number(req.params.id)}}, function(er, result) {
  if (er) {
console.log("Error finding documents :" + er);
res.json({success : false,message:"Error finding documents :" + er,landRecords:null});
  }

  if(result.docs.length > 0){
        console.log('Found documents with PID count:'+ req.params.id +":"+ result.docs.length);
let doc = result.docs[0];
let attachmentName;
if(doc['_attachments'] !=null){
attachmentName = Object.keys(doc['_attachments'])[0];
sketchURL= cloudant_url + "/" + mojaniDBName + "/" + doc["_id"]+ "/" + attachmentName;
}
res.json({success : true, message:"Found "+result.docs.length+" documents", landRecords: doc, sketchURL : sketchURL});
   
}
else
res.json({success : true, message: "No documents found", landRecords:null});
});
}else {
res.json({success : false, message:"PID sent null in request", landRecords:null});
}
});

/* GET API to get land records from MOJANI using Ward No & Area code*/
router.get('/api/getLandRecordsMojaniInLayout/:wardNo/:areaCode', (req, res) => {
 console.log('Inside Express api to get land records by Ward No');
mojani.find({selector:{wardNo:req.params.wardNo, areaCode:req.params.areaCode}}, function(er, result) {
  if (er) {
console.log("Error finding documents :" + er);
res.json({success : false,message:"Error finding documents",landRecords:null});
  }
  if(result.docs){
console.log('Found documents with ward No & Area Code count: '+ req.params.wardNo +"," + req.params.areaCode + " ="+ result.docs.length);
res.json({success : true, message:"Found "+result.docs.length+" documents", landRecords:result.docs});
  }else{
res.json({success : true, message:"Found 0 documents", landRecords:null});
  }
});
});

module.exports = router;
