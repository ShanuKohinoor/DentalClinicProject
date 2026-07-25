import { BadRequestError } from "../utils/error.js"
import { sendEmail } from "../utils/sendEmail.js"

export const getHome =(req,res)=>{    
    res.render('pages/welcome',{
        title: 'Peach Blossom Dental Care',
        country: 'Birmingham',
        showHeaderTitle: true
})
    
}

export const getAbout= (req,res)=>{    
    res.render('pages/aboutUs',{
      title:'About Us',
      showHeaderTitle: false
    })
}

export const getTeam= (req,res)=>{  
    res.render('pages/teamMembers',{
      title:'Meet Our Core Team',
      showHeaderTitle: false
    })
}

export const getServices= (req,res)=>{    
    res.render('pages/ourServices',{
      title:'Our Dental Services',
      showHeaderTitle: false
    })
}

export const getGallery= (req,res)=>{    
    res.render('pages/ourGallery',{
        title:'Our Gallery',
        showHeaderTitle: false
    })
}

export const getContact= (req,res)=>{    
    res.render('pages/contactUs',{
        title:'Get In Touch With Us',
        showHeaderTitle: false
    })
}

export const sendContactMessage=async(req,res,next)=>{
    try{
        const {name,email,message} = req.body        
        if(!name || !email || !message){
            throw new BadRequestError('All fields are required')
        }

        const subject = `New message from contact form ${name}`  // create subject of email
        const html = `                                           
             <h2>New contact message</h2>                                   
             <p><strong>Name:</strong>${name}</p>
             <p><strong>Email:</strong>${email}</p>
             <p><strong>Message:</strong>${message}</p>
            `                                                           // actual email content
                                                                        // html because,Nodemailer supports plain text and html

           await sendEmail(process.env.EMAIL_USER,subject,html)
           res.redirect('/clinic/contact?success=true')
        }catch(error){
            next(error)
        }
}

