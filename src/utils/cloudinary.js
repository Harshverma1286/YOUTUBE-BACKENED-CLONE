const cloudinary = require('cloudinary').v2;

const fs = require('fs');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

console.log("🔐 Cloudinary ENV Check:", process.env.CLOUDINARY_CLOUD_NAME);


const uploadoncloudinary = async (localfilepath) =>{
    try{
        if(!localfilepath) return null;
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        //console.log("file is uploaded on cloudinary",response.url);
        fs.unlinkSync(localfilepath);
        return response;
    }catch(error){
        console.error("❌ Cloudinary Upload Error:", error.message);
        fs.unlinkSync(localfilepath);
        return null;
    }
}

const deletefromcloudinary = async (publicId, type = "image") => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: type, // "video" or "image"
        });
    } catch (error) {
        console.error("Cloudinary delete error:", error);
    }
};

module.exports = {uploadoncloudinary,deletefromcloudinary};
