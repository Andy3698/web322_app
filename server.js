/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Le Tuan Anh Nguyen Student ID: 132792201 Date: 11th July, 2022
 *
 *  Online (Heroku) Link: https://blooming-coast-42936.herokuapp.com/
 *
 ********************************************************************************/

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const stripJs = require("strip-js");

const exphbs = require("express-handlebars");

const blog = require("./blog-service");

const app = express();

app.engine(
    ".hbs",
    exphbs.engine({
        extname: ".hbs",
        helpers: {
            sum: (a, b) => parseFloat(a) + parseFloat(b),
            navLink: function (url, options) {
                return (
                    "<li" +
                    (url == app.locals.activeRoute ? ' class="active" ' : "") +
                    '><a href="' +
                    url +
                    '">' +
                    options.fn(this) +
                    "</a></li>"
                );
            },
            equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                    throw new Error("Handlebars Helper equal needs 2 parameters");
                if (lvalue != rvalue) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            },
            safeHTML: function (context) {
                return stripJs(context);
            },
        },
    })
);
app.set("view engine", ".hbs");

cloudinary.config({
    cloud_name: "dddwtc0vex",
    api_key: "4666894844323734",
    api_secret: "gsvYlENJO_0ncAN6fYbrz0xMhBw",
    secure: true,
});

app.use(express.static('public'));
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});
app.get("/", (req, res) => {
    res.redirect("/blog");
});

app.get('/about', (req, res) => {
    res.render("about");
});
app.get('/blog/:id', async (req, res) => {


    let viewData = {};

    try {


        let posts = [];


        if (req.query.category) {

            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {

            posts = await blog.getPublishedPosts();

        }


        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));


        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {

        viewData.post = await blog.getPostById(req.params.id);
        let singlePost = viewData.post[0];
        viewData.post = singlePost;

    } catch (err) {
        viewData.message = "no results";
    }

    try {

        let categories = await blog.getCategories();


        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }


    res.render("blog", { viewData: viewData })
});


app.get('/blog', async (req, res) => {


    let viewData = {};

    try {


        let posts = [];


        if (req.query.category) {

            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {

            posts = await blog.getPublishedPosts();
        }


        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));


        let post = posts[0];


        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {

        let categories = await blog.getCategories();


        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", { viewData: viewData })

});





app.get('/posts', (req, res) => {
    if (req.query.category) {
        blog.getPostsByCategory(req.query.category)
            .then((data) => {
                res.render("posts", { posts: data });
            })
            .catch(() => {
                res.render("posts", { message: "no results" });
            })
    }
    else if (req.query.minDate) {
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
                res.render("posts", { posts: data });
            })
            .catch(() => {
                res.render("posts", { message: "no results" });
            })
    }

});

app.get('/categories', (req, res) => {
    blog.getCategories()
        .then((data) => {
            res.render("categories", { categories: data });
        })
        .catch(() => {
            res.render("posts", { message: "no results" });
        })
});

const upload = multer();

app.post('/posts/add', upload.single("featureImage"), (req, res) => {
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
    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;

        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog.addPost(req.body)
            .then(() => {
                res.redirect("/posts");
            });
    });
});

app.get('/posts/add', (req, res) => {
    res.render("addPost")
});

app.get('/post/:value', (req, res) => {
    blog.getPostById(req.params.value)
        .then((data) => {
            res.json({ data });
        })
        .catch((err) => {
            res.json(err);
        })

});

app.use((req, res) => {
    res.render("error");
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