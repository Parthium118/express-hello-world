//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
const itemSchema = new mongoose.Schema({
  name: String
});

const item = mongoose.model("item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const list = mongoose.model("list", listSchema);

const item1 = new item({
  name: "Welcome to your TODO list."
});

const item2 = new item({
  name: "Hit + to add an item to the list. "
});

const item3 = new item({
  name: "<-- Hit this to delete the item from the list."
});

const defaultItems = [item1 , item2, item3];


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const workItems = [];

app.get("/", function(req, res) {

  item.find({}).then(function(data){
    if (data.length === 0){
      item.insertMany(defaultItems).then(function(){
        console.log("Data inserted");
      });
      
    } else {
      res.render("list", {listTitle: "Today", newListItems: data});
      
    }
  }).catch(function(err){
    console.log(err);
  });

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item4 = new item({
    name: itemName
  });
  if (listName === "Today"){
    item.bulkSave([item4]);
    res.redirect("/");
  } else {
    list.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
  
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    item.findByIdAndRemove(checkedItemID).then(function(){
      res.redirect("/");
    });
  } else {
    list.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemID}}}
    ).then(function(){
      res.redirect("/" + listName);
    })
  }
});

app.get("/:customListName", function(req, res){
  const customListTitle = _.capitalize(req.params.customListName);
  const List = new list({
    name: customListTitle,
    items: defaultItems
  });
  
  list.findOne({name: customListTitle}).then(function(foundList){
    list.bulkSave([List]);
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }).catch(function(err){
    if (err){
      list.deleteOne({name: customListTitle});
    }
    res.redirect("/" + customListTitle)
  });
  
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
