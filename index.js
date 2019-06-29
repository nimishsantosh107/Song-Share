const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const cors = require('cors');

var app = express();
var server = http.Server(app);
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors());
var io = socketIO(server);

const saveAudio = (file) => {
	return new Promise((res,rej)=>{
		file.mv(__dirname+`/audio/${file.name}`, function(err) {
	    	if (err) rej(file);
	    	res(file);
	 	});
	});
}

//TEST ROUTE
app.use('/',express.static(path.join(__dirname,'/public')));

app.use('/audio',express.static(path.join(__dirname,'/audio')));

app.get('/songlist',async (req,res)=>{
	fs.readdir(path.join(__dirname,'/audio'),(err,songList)=>{
		res.status(200).send(songList);
	});
});

app.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {return res.status(418).send('NO FILES');}

  let files = req.files.files;	//files is the NAME of FIELD in FORM
  let promiseArr = [];
  let nameArr = [];

  files.forEach((file)=>{
  	nameArr.push(file.name);
  	promiseArr.push(saveAudio(file));
  });

  Promise.all(promiseArr).then(()=>{
  	io.emit('newSongs',nameArr);
  	res.status(200).json({status: true});
  }).catch((file)=>{
  	res.status(418).json({
  		status: false,
  		file: file.name
  	});
  });
});


server.listen(3000,()=>{console.log('SERVER IS UP ON PORT 3000');});