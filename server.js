require('dotenv').config()
const express = require('express')
const fs = require('fs')
const multer = require('multer')
//const cors = require("cors"); //remove
const database = require('./database');

const upload = multer({ dest: 'images/' })

const app = express()
app.use(express.static("build"))
//app.use(cors()); //remove

app.get('/api/images', async (req, res) => {
    let results = await database.getImages();
    console.log(results);
    res.send(results);
})

// app.use('/images', express.static('images'))
app.get('/images/:imageName', (req, res) => {
  // do a bunch of if statements to make sure the user is 
  // authorized to view this image, then

  const imageName = req.params.imageName
  const readStream = fs.createReadStream(`images/${imageName}`)
  readStream.pipe(res)
})

app.post('/api/images', upload.single('image'), async (req, res) => {
  const imagePath = "images/" + req.file.filename //req.file.path
  const description = req.body.description

  // Save this data to a database probably

  console.log(description, imagePath)
  //res.send({description, imagePath})
  let result = await database.addImage(imagePath, description);
  console.log(result);
  res.send(result)
})

app.listen(8080, () => console.log("listening on port 8080"))