import express, { application } from 'express'


const router = express.Router()

import {getHome,getAbout,getTeam,getServices,getGallery,getContact,sendContactMessage } from "../controllers/clinicController.js";

router.get('/home',getHome)
router.get('/about',getAbout)
router.get('/team',getTeam)
router.get('/services',getServices)
router.get('/gallery',getGallery)
router.get('/contact',getContact)
router.post('/contact',sendContactMessage)

export default router
