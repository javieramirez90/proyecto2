const express = require('express');
const router  = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const uploadCloud = require('../helpers/cloudinary');
const Carrito = require('../models/Carrito');

function isAuthenticated(req,res,next){
 if(req.isAuthenticated()){
   return next()
 } else {
   res.redirect('/login');
 }
}

function isLoggedIn(req,res,next){
 if(!req.user){
   res.redirect('/login')
 }else{
   next();
 }
}

router.get('/', isLoggedIn, (req,res,next)=>{
 res.render('user/profile', req.user);
})

router.get('/recetas/:id/delete',(req,res)=>{
  Recipe.findByIdAndRemove(req.params.id)
  .then(recipe=>{
    res.redirect('/perfil/:username');
  });
});

router.get('/perfil/:username',(req,res,next)=>{
  User.findById(req.user.id)
  .populate('recetas')
  .then(user=>{
    res.render('user/personal', user);
  })
})

router.post('/recetas', (req,res,next)=>{
  Recipe.find({ nombre: { $regex:req.body.nombre, $options: 'i' } })
  .then(recipe=>{
    res.render('user/recetas', {recipe})
  })
  .catch(e=>next(e));
})

router.get('/recetas/:id', (req,res,next) =>{
  Recipe.findById(req.params.id)
  .then(recipe => {
    res.render('user/recetaInd', recipe)
  })
  .catch(e => next(e));
})

router.post('/carrito', (req,res, next)=>{
Carrito.findOneAndUpdate({user:req.user.id}, {$push:{recipes:req.body.recipeId}})
.then(carrito => {
  res.redirect('/profile/carrito')
})
})

router.get('/carrito', (req,res,next)=>{
  Carrito.findOne({user:req.user.id})
  .populate('recipes')
  .then(carrito=>{
    res.render('user/carrito', carrito);
  })
})

router.get('/crearReceta', (req,res,next)=>{
  res.render('user/recetaForm')
})

router.post('/crearReceta', uploadCloud.single('photo'), (req,res,next)=>{
    req.body.ing= []
    ingredientes = req.body.ingredientes
    req.body.ing.push(ingredientes)
    req.body.photoURL = req.file.url
    req.body.usuario = req.user
    Recipe.create(req.body)
    .then(recipe=>{
      return User.findByIdAndUpdate(req.user._id, {$push:{recetas:recipe._id}});
    })
    .then(user=>{
      res.redirect('/profile/perfil/:username');
    })
.catch(e=>next(e));
})


module.exports = router;