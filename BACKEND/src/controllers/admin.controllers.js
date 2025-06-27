export const loginAdmin = (req,res)=>{
    const {email,password}=req.body;
    if(
        email===process.env.ADMIN_EMAIL &&
        password===process.env.ADMIN_PASSWORD
    ){
        return res.status(200).json({user:{role:"admin",email}});
    }
    else{
        return res.status(401).json({message:"Invalid Admin Credentials"});
    }
}