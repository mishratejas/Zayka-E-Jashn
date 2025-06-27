export const loginManager = (req,res)=>{
    const{email,password}=req.body;

    if(
        email===process.env.MANAGER_EMAIL &&
        password === process.env.MANAGER_PASSWORD
    ){
        return res.status(200).json({user:{role:"manager",email}});
    }
    else{
        return res.status(401).json({message:"Invalid Manager Credentials"});
    }
}