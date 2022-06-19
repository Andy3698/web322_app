/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Le Tuan Anh Nguyen Student ID: 132792201 Date: 18th June, 2022
*
*  Online (Heroku) Link: https://blooming-coast-42936.herokuapp.com/
*
********************************************************************************/  
const { rejects } = require("assert");
const fs = require("fs"); 
const { resolve } = require("path");
var blog = require('./blog-service');
var posts = require('./data/posts.json');

var postArray = [];
var categoriesArray = [];

//Load data to array
module.exports.initialize = () => {
    let promise = new Promise((resolve, rejects) => {
        try {
            fs.readFile('./data/posts.json', 'utf8', (err, data) => {
                if (err) throw err;
                postArray = JSON.parse(data);
            });     
            fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                if (err) throw err;
                categoriesArray = JSON.parse(data);
            });     
        }
        catch(ex){
            rejects({message : "unable to read file"});
        }
        resolve("Successful!!!");
    })
    return promise;
}

//get Post and Category Array
module.exports.getAllPosts = () => {
    let promise = new Promise((resolve, rejects) => {
       if(postArray.length === 0){
           rejects({message : "no results returned"})
       }
       else{
           resolve(postArray)
       }
      
    })
    return promise;
}

module.exports.getPublishedPosts = () => {
    let promise = new Promise((resolve, rejects) => {
       if(postArray.length === 0){
           rejects({message : "no results returned"})
       }
       else{
           let publishedPosts = []
           postArray.forEach(post => {
               if(post.published === true){
                publishedPosts.push(post);
               }
           })

           resolve(publishedPosts)
       }
    })
    return promise;
}

module.exports.getCategories = () => {
    let promise = new Promise((resolve, rejects) => {
        if(categoriesArray.length === 0){
            rejects({message : "no results returned"})
        }
        else{
            resolve(categoriesArray)
        }  
     })
     return promise;
}

//Add a new post
module.exports.addPost = (postData) => {
    let promise = new Promise((resolve, rejects) => {
        typeof postData.published === "undefined" ? postData.published = false : postData.published = true;
        postData.category = parseInt(postData.category, 10);
        postData.id = postArray.length + 1;
        postArray.push(postData);
        
        resolve (postArray);
    })
    return promise;
}

//Query
module.exports.getPostsByCategory = (category) => {
    let promise = new Promise((resolve, rejects) => {
        let post_Cate = postArray.filter(post => post.category == category)
        if (post_Cate.length === 0) {
            rejects({message : "no results returned"})
        }
        resolve (post_Cate);
    })
    return promise;
}

module.exports.getPostById = (id) => {
    let promise = new Promise((resolve, rejects) => {
        let post_id = postArray.filter(post => post.id == id)
        if (post_id.length === 0) {
            rejects({message : "no results returned"})
        }
        resolve (post_id);
    })
    return promise;
}

module.exports.getPostsByMinDate = (minDateStr) => {
    let promise = new Promise((resolve, rejects) => {
        let postDateSearch = postArray.filter(post => new Date(post.postDate) >= new Date(minDateStr))
        if (postDateSearch.length === 0) {
            rejects({message : "no results returned"})
        }
        resolve (postDateSearch);
    })
    return promise;
}