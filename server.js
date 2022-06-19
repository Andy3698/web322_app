/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Le Tuan Anh Nguyen Student ID: 132792201 Date: 18th June, 2022
*
*  Online (Heroku) Link: https://git.heroku.com/blooming-coast-42936.git
*
********************************************************************************/

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

const blog = require('./blog-service');

const app = express();

cloudinary.config({
    cloud_name: 'dddwtc0vex',
    api_key: '4666894844323734',
    api_secret: 'gsvYlENJO_0ncAN6fYbrz0xMhBw',
    secure: true
});

app.use(express.static('public'));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.redirect("/about");
});

app.get('/about',(req,res) => {
    res.sendFile(path.join(__dirname+'/views/about.html'));
});


app.get('/blog',(req,res) => {
    blog.getPublishedPosts()
         .then((data) => {
             res.json(data);
         })
         .catch((err) => {
             res.json(err);
         })
});

//Display and Query Post 
app.get('/posts', (req,res) => {
    if(req.query.category){
        blog.getPostsByCategory(req.query.category)
            .then((data) => {
                res.json(data);
            })
            .catch((err) => {
                res.json(err);
            })
    }
    else if(req.query.minDate){
        blog.getPostsByMinDate(req.query.minDate)
            .then((data) => {
                res.json(data);
            })
            .catch((err) => {
                res.json(err);
            })
    }
    else {
        blog.getAllPosts()
            .then((data) => {
                res.json(data);
             })
            .catch((err) => {
                res.json(err);
             })
    }
    
});

app.get('/categories',(req,res) => {
    blog.getCategories()
         .then((data) => {
             res.json(data);
         })
         .catch((err) => {
             res.json(err);
         })
});

const upload = multer();

app.post('/posts/add',  upload.single("featureImage"), (req,res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                    reject(error);
                    }
                }
            );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;

        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog.addPost(req.body)
                .then(() => {
                res.redirect("/posts");
        });
    });
});

app.get('/posts/add',(req,res) => {
    res.sendFile(path.join(__dirname+'/views/addPost.html'));
});

app.get('/post/:value', (req,res) => {
    blog.getPostById(req.params.value)
        .then((data) => {
            res.json({data});
         })
        .catch((err) => {
            res.json(err);
    })
    
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname+'/views/error.html'));
});
// setup http server to listen on HTTP_PORT
blog.initialize()
     .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Example app listening at http://localhost:${HTTP_PORT}`);
        });
     })
     .catch(err => {
         console.log(err);
     })