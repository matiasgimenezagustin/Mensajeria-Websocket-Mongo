const express = require('express');
const User = require('../dao/models/userModel');

const router = express.Router()


router.post('/', async (req, res) => {
    const { user } = req.body;
    let urlToRedirect = '/products'
    if(user.username != '' && user.email == 'adminMiguel@suempresa.com' && user.password == "adminMiguel3r123 "){
        console.log('hola')
        res.redirect('/products?rol=admin&email=adminMiguel@suempresa.com&username='+user.username)
    }else{
        try {
            const existingUser = await User.findOne({
                username: user.username,
                password: user.password, 
            });
            console.log(existingUser)
            if (existingUser) {
                console.log('correcto')
                res.redirect(urlToRedirect + '?rol=user&email=' + user.email + '&username='+user.username); 
                
            } else {
                res.status(401).render('login', { error: 'Credenciales incorrectas' });
            }
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            res.status(500).send({ ok: false, message: 'Error en el inicio de sesión' });
        }
    }
});

module.exports = router