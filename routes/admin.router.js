const express = require('express')
const router = express.Router()
const upload = require('../middleware/multer.middleware')
const LoginedUser = require('../middleware/isloggedin');
const login = require('../middleware/logined');
const {homepage,singlePost,searchRecipe,adminLogin,logout,createPost,addPost,
allPost,editPost,UpdatePost,deletePost,createcategory,allCategories,addcategory,
editcategory,updatecategory,deletecategory,allUser,createUser,addUser,editUser,updateUser,deleteUser}= require("../controllers/recipe.controller");


// sITE routes

router.get('/', homepage);
router.get('/single/:id', singlePost)
router.post('/search',searchRecipe);


// ADMIN routes
router.get('/login',(req, res) => {res.render('login')})
router.post('/login',adminLogin)
router.get('/logout', logout)

// POST routes
router.get('/adminpanel',allPost)
router.get('/createpost',addPost)
router.post('/adminpanel', upload.single('image'),createPost)
router.get('/updatepost/:id',editPost)
router.post('/adminpanel/:id',upload.single('image'),UpdatePost)
router.get('/deletepost/:id',deletePost)



// CATEGORY routes
router.get('/category',allCategories)
router.get('/addcategory',addcategory)
router.post('/category',createcategory)
router.get('/updatecategory/:id',editcategory)
router.post('/category/:id',updatecategory)
router.get('/deletecategory/:id', deletecategory)

// USER routes
router.get('/user',allUser)
router.get('/adduser',addUser)
router.post('/user',createUser)
router.get('/updateuser/:id',editUser)
router.post('/user/:id',updateUser)
router.get('/deleteuser/:id',deleteUser)


module.exports = router