'use strict';

const express = require('express');
const router = express.Router();


const controller = require('../controllers/question');

/*
router.get('/', controller.index);
router.post('/', controller.save);
router.get('/new', controller.new);
router.get('/show/:id', controller.show);
router.get('/edit/:id', controller.edit);
router.post('/edit/:id', controller.update);
router.get('/delete/:id', controller.delete);
*/

router.route('/').get(controller.index);
//                 .post(controller.index);
//router.route('/:searchType/:searchText').get(controller.index);
router.route('/new').get(controller.new)
                 .post(controller.save);
               
router.route('/show/:id').get(controller.show);
router.route('/edit/:id').get(controller.edit)
                         .post(controller.update);
router.route('/delete/:id').get(controller.delete);


module.exports = router;
