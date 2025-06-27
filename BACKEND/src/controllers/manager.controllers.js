import jwt from "jsonwebtoken";

export const loginManager = (req,res)=>{
    const{email,password}=req.body;
    if(
        email===process.env.MANAGER_EMAIL &&
        password === process.env.MANAGER_PASSWORD
    )
    {
      const token = jwt.sign(
      {role:"manager",email},
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
    return res.status(200).json({
      user: {role:"manager",email},
      accessToken:token
    });
  } 
  else{
    return res.status(401).json({ message:"Invalid Manager Credentials" });
  }
};