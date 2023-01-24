require('dotenv').config()
const express = require('express')
const fs = require('fs')
const multer = require('multer')
//const cors = require("cors"); //remove
const database = require('./database');
const s3 = require('./s3');
const crypto = require('crypto')

//const upload = multer({ dest: 'images/' })
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const app = express()
app.use(express.static("build"))
//app.use(cors()); //remove

/*app.get('/api/images', async (req, res) => {
    let results = await database.getImages();
    console.log(results);
    res.send(results);
})*/

app.get("/api/images", async (req, res) => {
  const images = await database.getImages()

  // Add the signed url to each image
  for (const image of images) {
    image.imageURL = await s3.funcGetSignedUrl(image.file_path)
  }

  res.send(images)
})

// app.use('/images', express.static('images'))
//app.get('/images/:imageName', (req, res) => {
  // do a bunch of if statements to make sure the user is 
  // authorized to view this image, then

//  const imageName = req.params.imageName
//  const readStream = fs.createReadStream(`images/${imageName}`)
//  readStream.pipe(res)
//})

/*app.post('/api/images', upload.single('image'), async (req, res) => {
  const imagePath = "images/" + req.file.filename //req.file.path
  const description = req.body.description

  // Save this data to a database probably

  console.log(description, imagePath)
  //res.send({description, imagePath})
  let result = await database.addImage(imagePath, description);
  console.log(result);
  res.send(result)
})*/

app.post("/api/images", upload.single('image'), async (req, res) => {
  // Get the data from the post request
  const description = req.body.description
  const fileBuffer = req.file.buffer
  const mimetype = req.file.mimetype
  const fileName = generateFileName()//"a_file_name"

  // Store the image in s3
  const s3Result = await s3.uploadImage(fileBuffer, fileName, mimetype)

  // Store the image in the database
  const databaseResult = await database.addImage(fileName, description)

  res.status(201).send(databaseResult)
})

app.delete("/api/images/:id", async(req, res) => {
  const id = req.params.id
  const image = await database.getImage(id);

  if(!image){
    res.status(404).send("Image not found")
    return
  }

  const s3result = await s3.deleteImage(image.file_path)
  const dbResult =  await database.deleteImage(id)
  res.status(200).send("Image deleted")
})

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`listening on port ${port}`))