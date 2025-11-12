const express=require('express')
const router=express.Router()
const userController=require("../controllers/userController")
const {authUser}=require("../middlewares/auth")
const {checkRole}=require("../middlewares/roleCheck")

router.post("/register",userController.register)
router.post("/login",userController.login)
router.get("/profile",authUser,userController.getProfile)

router.get("/",authUser,checkRole(["admin"]),userController.getAllusers)
router.put("/:id",authUser,userController.updateUser)
router.delete("/:id",authUser,checkRole(["admin"]),userController.deleteUser)

router.get("/check-user", authUser, userController.checkUser);
router.post("/logout", authUser, userController.logout);


module.exports=router