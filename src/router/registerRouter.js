const express = require('express')
const User = require('../dao/models/userModel'); 

const router = express.Router()

router.get('/', (req, res)=>{

})



router.post('/', async (req, res) => {

    try {
        const { user } = req.body;
        
        const newUser = new User({
            username: user.username,
            email: user.email,
            password: user.password, 
        });

        await newUser.save();

        res.redirect('/')
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).send({ ok: false, message: 'Error al registrar el usuario' });
    }
});

module.exports = router