const categorymodel = require("../models/category.model");
const recipemodel = require("../models/recipe.model");
const usermodel = require("../models/user.model");
const { setUser } = require('../service/auth')
const bcrypt = require('bcryptjs')

const homepage = async (req, res) => {
  try {
      const totalPosts = await recipemodel.countDocuments();
      let categories = await categorymodel.find()
      let posts = await recipemodel.aggregate([
          { $match: { status: true } },
          {
              $lookup: {
                  from: 'categories',
                  localField: 'category',
                  foreignField: '_id',
                  as: 'category'
              }
          },
          { $unwind: '$category' },
          {
              $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user'
              }
          },
          { $unwind: '$user' },
          {
              $addFields: {
                  formattedDate: {
                      $dateToString: {
                          format: '%d-%m-%Y',
                          date: '$date'
                      }
                  }
              }
          },
          {
              $project: {
                  title: 1,
                  description: 1,
                  category: 1,
                  ingredients: 1,
                  image: 1,
                  formattedDate: 1,
              }
          }
      ])
          return res.render('latest-recipe', { categories, posts, totalPosts })
  } catch (error) {
      console.log(error);
  }
}

const singlePost = async (req, res) => {
  let categories = await categorymodel.find()
  let posts = await recipemodel.aggregate([
      {
          $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
      },
      {
          $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
          }
      },
      {
          $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true
          }
      },
      {
          $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user'
          }
      },
      {
          $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true
          }
      },
      {
          $addFields: {
              formattedDate: {
                  $dateToString: {
                      format: '%d-%m-%Y',
                      date: '$date'
                  }
              }
          }
      },
  ]);
  return res.render('', { posts, categories })
}


const searchRecipe = async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        let recipe = await recipemodel.find({ $text: { $search: searchTerm } });
        res.render('search', { recipe });
    } catch (error) {
        res.json({ errorMessage: error })
    }
}

// LOGIN controller
const adminLogin = async (req, res) => {
    try {
    //   console.log(req.body); 
      const { username, password } = req.body; 
      if (!username || !password) {
        return res.render('login', { error: 'Please provide username and password' });
      } 

      const user = await usermodel.findOne({ username });
      if (!user) {
        return res.render('login', { error: 'User not found!' });
      } 

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.render('adminpanel', { error: 'Invalid credentials!' });
      }
      const token = setUser({ username: user.username });
      res.cookie('token', token);
      res.redirect('/adminpanel');
    } catch (error) {
      console.error('adminLogin :'+ error);
      res.render('adminpanel', { error: 'An error occurred. Please try again.' });
    }
}

const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login')
}

// POST controller
const createPost = async (req, res) => {
  try {  
    const { title,description,ingredients,category} = req.body; 
    const image = req.file?.filename 
      const data = await recipemodel.create({title,description,ingredients,category,image})
    if (!data) {
      return res.status(404).redirect('/createpost')
  }
       return res.redirect('/adminpanel')
  } catch (error) {
    res.status(400).send({ error: 'Failed to create post'});
  }
}

const addPost = async (req, res) => {
  try {
    const categories = await categorymodel.find({});
    res.render('createpost', { categories });
  } catch (error) {
    res.status(500).send(error);
  }
}

const allPost = async (req, res) => {
   try {
      const totalPosts = await recipemodel.countDocuments();
      let posts = await recipemodel.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
            }
        },
        {
          $addFields: {
            formattedDate: {
              $dateToString: {
                format: '%d-%m-%Y',
                date: '$date'
              }
            }
          }
        },
        {
          $project: {
            title: 1,
            description: 1,
            ingredients: 1,
            category: 1,
            formattedDate:1
          }
        },
        {
          $sort: { date: -1 }
        },  
      ])  
      // console.log(posts)
      return res.render('adminpanel', { posts,totalPosts })
    } catch (err) {
      console.log('error :' + err.message);
    }
  
}

const editPost = async (req, res) => {
  let categories = await categorymodel.find({})
  let recipe =await recipemodel.findById({_id:req.params.id})

  return res.render('updatepost', {recipe, categories})
}

const UpdatePost = async (req, res) => {
  try {
      const { title, description,ingredients,category } = req.body;
      image = req.file?.filename;
      if (image) { deleteImage(req.params.id) }
      await recipemodel.findByIdAndUpdate({ _id: req.params.id },{ title, description, ingredients,category,image })
      res.redirect('/adminpanel')
  } catch (error) {
      res.render('updatepost', { error: 'Unsuccessful!' })
  }
}

const deletePost = async (req, res) => {
  let { title,description,ingredients,category,image } = req.body;
  let data = await recipemodel.findByIdAndDelete(req.params.id, {title,description,ingredients,category,image})
  if (!data) {
    res.send('Post not found')
  } else {
    res.redirect('/adminpanel')
  }
}

// CATEGORY controller
const allCategories = async (req, res) => { 
  try {
    const totalCategories = await categorymodel.countDocuments(); 
    let categories = await categorymodel.aggregate([
        {
          $lookup: {
            from: 'recipes',
            localField: '_id',
            foreignField: 'category',
            as: 'recipes'
          }
        },
        {
          $addFields:{
            postLength:{
              $size:'$recipes'
            }
          }
        },

      ])      
    res.render('category', { totalCategories,categories })
  }
  catch (error) {
      console.log('error :' + error.message);
     }
}

const createcategory = async (req,res)=>{
  try {
      let { name} = req.body
      let data = await categorymodel.create({ name})
  
      res.redirect('/category')
    } catch (err) {
      res.send(err.message)
    }
}

const addcategory = (req, res) => {
  res.render('addcategory')
}

const editcategory = async (req, res) => {
  let category = await categorymodel.findById(req.params.id)

  res.render('updatecategory',{ category })
}

const updatecategory = async (req, res) => {
  let { name} = req.body;
  let category = await categorymodel.findByIdAndUpdate(req.params.id, {name}, { new: true })
  res.redirect({category},'/category')
}

const deletecategory = async (req, res) => {
  let { name} = req.body;   
  let data = await categorymodel.findByIdAndDelete(req.params.id, { name })
  res.redirect('/category')
}

// USER CONTROLLER
const allUser = async (req,res) =>{
  try {
    const totalUsers = await usermodel.countDocuments(); 
    const users = await usermodel.find(); 

    res.render('user', {users,totalUsers},);   
  }catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

const createUser = async (req, res) => {
  try {
      let { username, password, email, role } = req.body;
      let existingUser = await usermodel.findOne({ email });
      if (existingUser) return res.status(400).send('You already have an account.');

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      let newUser = await usermodel.create({
          username,
          email,
          password: hashedPassword,
          role
      });
      let token = generateToken(newUser);
      res.cookie('token', token);
      await newUser.save();
      return res.redirect('/user');
  } 
  catch(err){
    res.send(err)
 }
}

const addUser = async (req, res) => {
  try {
      const { username, email, password, role } = req.body;
      const data = await usermodel.create({
          username, email,
          password: await bcrypt.hash(password, 10),
          role
      })
      if (!data) { res.redirect('/user') }
  } catch (error) {
      res.render('adduser')
  }
}

const editUser = async (req,res) =>{
  const roles =['User', 'Admin']
  let user = await usermodel.findById(req.params.id, req.body)
  res.render('updateuser', {user, roles},)
}

const updateUser = async (req,res) =>{
  let {username,email,role} = req.body
  let user = await usermodel.findByIdAndUpdate(req.params.id,{username,email,role}, {new:true})
  res.redirect('/user',{user})
}

const deleteUser = async (req,res) =>{
    let { username, password, email, role } = req.body;
   await usermodel.findByIdAndDelete(req.params.id,{username, password, email, role})
          res.redirect('/user')
 
}


module.exports = {homepage,singlePost,searchRecipe,adminLogin,logout,createPost,
addPost,allPost,editPost,UpdatePost,deletePost,createcategory,allCategories,addcategory,editcategory,
updatecategory,deletecategory,allUser,createUser,addUser,editUser,updateUser,deleteUser}




