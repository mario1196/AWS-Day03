//import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
const {S3Client, PutObjectCommand, DeleteObjectCommand} = require("@aws-sdk/client-s3");
//import { GetObjectCommand } from "@aws-sdk/client-s3"
const {GetObjectCommand} = require("@aws-sdk/client-s3");
//import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
//const multer = require('multer')
const sharp = require('sharp');

//import dotenv from 'dotenv'
const dotenv = require('dotenv');

dotenv.config()

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

//const storage = multer.memoryStorage()
//const upload = multer({ storage: storage })

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

async function uploadImage(imageBuffer, imageName, mimetype) {
  const newBuffer = await sharp(imageBuffer).resize({height: 1920, width: 1080, fit:"contain"}).toBuffer()
    // Create params that the S3 client will use to upload the image
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: newBuffer,//imageBuffer,
      ContentType: mimetype
    }
  
    // Upload the image to S3
    const command = new PutObjectCommand(params)
    const data = await s3Client.send(command)
  
    return data
}
exports.uploadImage = uploadImage

async function funcGetSignedUrl(fileName) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName
    })
  
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 })
  
    return signedUrl
}
exports.funcGetSignedUrl = funcGetSignedUrl

async function deleteImage(imageName) {
  const params = {
    Bucket: bucketName,
    Key: imageName
  }

  const command = new DeleteObjectCommand(params)
  await s3Client.send(command)

  return imageName
}
exports.deleteImage = deleteImage