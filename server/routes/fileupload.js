var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var vcapServices = require("vcap_services");
var Cloudant = require('@cloudant/cloudant');

var credentials = {};
if(process.env.VCAP_SERVICES){ //for bluemix env
	credentials = vcapServices.getCredentials('cloudantNoSQLDB', null, 'cloudant_land_records'); //get the cloudant_land_records service instance credentials
	console.log("credentials",credentials);
}

var cloudantURL = process.env.CLOUDANT_DB_URL || credentials.url;
var cloudant = Cloudant(cloudantURL);

var mojaniDBName = process.env.MOJANI_DB || "mojani";
//connect to MOJANI DB
var mojani = cloudant.use(mojaniDBName);



// set the directory for the uploads to the uploaded to
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });
//file upload function
router.post("/fileUpload", upload.array("uploads[]", 12), function (req, res) {
  console.log('files', req.files);
  //res.send(req.files);
  var file = req.files[0];
  /*files [ { fieldname: 'uploads[]',
    originalname: 'Penguins_123256478.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: './uploads/',
    filename: 'Penguins_123256478.jpg',
    path: 'uploads\\Penguins_123256478.jpg',
    size: 777835 } ] */
	
	//extract pid from file name
	var pid = file.filename.split('_').pop().split('.').shift();
	
  mojani.find({selector:{pid:Number(pid)}}, function(er, result) {
	  if (er) {
		console.log("Error finding documents");
		res.json({success : false,message:"Error finding document for attachment",landRecords:null});
	  }
	  if(result.docs && result.docs.length > 0){
	  console.log('Found documents with pid for attachment: '+ pid +":"+ result.docs.length);
	  		fs.readFile(file.path, function(err, data) {
		  if (!err) {
			  console.log("doc data :",result.docs[0]);
			    console.log("_rev value :",result.docs[0]['_rev']);
				mojani.attachment.insert(file.filename, file.filename, data, file.mimetype,
				  { rev: result.docs[0]["_rev"] }, function(err, body) {
					if (!err){
					  console.log(body); //log response
					  res.json({success : true,message:"Uploaded documents successful"});
					  }
					  console.log("upload attachment failed :" , err);
					  res.json({success : false,message:"error occurred"});
					  
				});
		  }
		});
	}
	});



});

/* 
var uploadStorage = multer.memoryStorage();
var upload = multer({storage: uploadStorage})
app.post('/processform', upload.single('myfile'), processForm);
 */


module.exports = router;