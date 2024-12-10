const dayjs = require('dayjs');
const fs = require('fs').promises;

exports.fileUpload = async function (file, directory) {
    console.log("fileupload function executed");

    if (!file || !directory) {
        throw new Error("File and directory parameters are required");
    }

    return new Promise(async (resolve, reject) => {
        try {
            const mime_type = file.split(";")[0].split(":")[1].split("/")[1];
            console.log("mime_type :", mime_type);

            const allowedTypes = ['png', 'jpg', 'jpeg', 'mp4', 'pdf'];
            if (!allowedTypes.includes(mime_type)) {
                console.log("Invalid file type");
                return reject("File size up to 100mb and Formats .png, .jpeg, .jpg, .mp4, .pdf are only allowed");
            }

            console.log("file type allowed..");

            const randomNum = String(Math.floor((Math.random() * 100)));
            console.log("random number :", randomNum);
            console.log("dayjs() :", dayjs());

            const sanitizedFileName = dayjs().format('YYYYMMDDHHmmss') + randomNum + "." + mime_type;
            console.log("file_name :", sanitizedFileName);

            const upload_path = `upload/${directory}`;
            console.log("upload_path :", upload_path);

            const base64 = file.split(';base64,')[1];

            try {
                await fs.mkdir(upload_path, { recursive: true });
            } catch (err) {
                console.log("err : ", err);
                return reject(err.message ? err.message : err);
            }

            const final_upload_path = `${upload_path}/${sanitizedFileName}`;
            console.log("final_upload_path :", final_upload_path);

            try {
                await fs.writeFile(final_upload_path, base64, { encoding: 'base64' });
                resolve(final_upload_path);
            } catch (err) {
                console.log("err : ", err);
                reject(err.message ? err.message : err);
            }
        } catch (error) {
            console.log(error);
            reject(error.message ? error.message : error);
        }
    });
};
