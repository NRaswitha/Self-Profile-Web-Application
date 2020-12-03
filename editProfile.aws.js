const fs = require("fs");
const AWS = require("aws-sdk");

const UserModel = require("./model-mvc");

// Enter copied or downloaded access ID and secret key here
const ID = "AKIAXR6QT46DAWFZQ5PQ";
const SECRET = "2xeSiUBY4JMTeux1oZ8Jsy9g9bPEud8PM7aLlT9r";
const BUCKET_NAME = "aws-sample-1997";

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
  region: "us-east-2",
});

exports.editProfile = (req, res, next) => {
  const { name, biography } = req.body;
  const userId = req.user._id;

  // If no file is sent to the server
  if (req.files === null) {
    console.log("No File sent to server"); // Optional
    return res.status(400).json({ error: "No file sent to server" });
  }

  const file = req.files.image;
  const fileName = file.name;
  let { dpURL } = req.user;

  file.mv(fileName, (error) => {
    if (error) {
      console.error("File Path Doesn't exist");
      return res.status(500).json({ error: "File Path Doesn't exist" });
    }

    // Params for AWS S3
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fs.readFileSync(fileName),
      ACL: "public-read",
    };
    // Uploading files to the bucket
    s3.upload(params, (err, data) => {
      if (err) {
        throw err;
      }

      fs.unlinkSync(fileName);
      dpURL = data.Location;

      UserModel.findByIdAndUpdate(
        userId,
        {
          name,
          biography,
          dpURL,
        },
        { new: true }
      )
        .then((newUserData) => {
          newUserData = newUserData.toObject();
          delete newUserData.password;
          req.user = newUserData;
          res.redirect("/login");
        })
        .catch((error) => res.status(401).json(error));
    });
  });
};
