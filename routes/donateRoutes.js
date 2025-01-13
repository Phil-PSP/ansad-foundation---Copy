const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('pages/donate', {
        path: '/donate',
        message: req.flash('message') || null
    });
});

router.post('/', (req, res) => {
    // Handle the POST request
    try {
        const { name, email, amount } = req.body;
        // Add your donation processing logic here
        
        req.flash('message', 'Thank you for your donation!');
        res.redirect('/donate');
    } catch (error) {
        console.error('Donation error:', error);
        req.flash('message', 'An error occurred while processing your donation.');
        res.redirect('/donate');
    }
});

module.exports = router; 