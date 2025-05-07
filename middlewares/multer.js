const multer = require('multer');

// const storage = multer.diskStorage({
//     filename: function (req,file,cb) {
//         const ext = file.mimetype.split("/")[1];
//         const fileName = `${Date.now()}.${ext}`;
//         cb(null, fileName)
//     }
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); 
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  };

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;