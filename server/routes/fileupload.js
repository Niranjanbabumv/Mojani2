var express = require('express');
var router = express.Router();
var multer = require('multer');
var os = require('os');
var fs = require('fs');
var vcapServices = require("vcap_services");
var Cloudant = require('@cloudant/cloudant');
var credentials = {};

if(process.env.VCAP_SERVICES){ //for bluemix env
	credentials = vcapServices.getCredentials('cloudantNoSQLDB', null, 'cloudant_land_records'); //get the cloudant_land_records service instance credentials
	console.log("credentials",credentials);
}

var cloudant_url = process.env.CLOUDANT_DB_URL || credentials.url;
var cloudant = Cloudant(cloudant_url);



var mojaniDBName = process.env.MOJANI_DB || "mojani";
//connect to MOJANI DB
var mojani = cloudant.use(mojaniDBName);



// set the directory for the uploads to the uploaded to
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,os.tmpdir());
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

/* 
var uploadStorage = multer.memoryStorage();
var upload = multer({storage: storage})
app.post('/processform', upload.single('myfile'), processForm);
 */
 
var upload = multer({ storage: storage });
//file upload function
router.post("/fileUpload", upload.array("uploads[]", 5), function (req, res) {
  //res.send(req.files);
  var file = req.files[0];
    console.log('file :', file);
  /*files [ { fieldname: 'uploads[]',
    originalname: 'Penguins_123256478.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: './uploads/',
    filename: 'Penguins_123256478.jpg',
    path: 'uploads\\Penguins_123256478.jpg',
    size: 777835 } ] */
	
	//extract pid from file name
	var pid = file.filename.split('_sketch').shift();
	
  mojani.find({selector:{pid:Number(pid)}}, function(er, result) {
	  if (er) {
		console.log("Error finding documents");
		res.json({success : false,message:"Error finding document for attachment",landRecords:null});
	  }
	  if(result.docs && result.docs.length > 0){
	  console.log('Found documents with pid for attachment: '+ pid +":"+ result.docs.length);
	  		fs.readFile(file.path, function(err, data) {
				  if (!err) {
				  		var doc = result.docs[0];
					    console.log("doc data :",doc);
						console.log("_rev value :",doc['_rev']);
				       /*Attachment uploaded from the client*/
						mojani.attachment.insert(doc["_id"], file.filename, data, file.mimetype ,{rev:doc['_rev']},
						function(err, body) {
							if (!err){
							  console.log("file attached to the document ",body); //log response
							  fs.unlink(file.path, (err) => {
											if (err) console.log("File uploaded deletion failed !",file.path);
											else console.log("File successfully deleted", file.path);
							  });
							  res.json({success : true,message:"Upload of file successful"});
							  }
							 else{ console.log("upload attachment failed :" , err);
							  res.json({success : false,message:"error occurred"});
							  }
							  
						});
				  }
		}); 
	}
  });
});




module.exports = router;