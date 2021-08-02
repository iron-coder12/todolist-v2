const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true
});

const itemsSchema = {
    name: String
}; //Hi

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your To Do list!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {



    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added the Documents to the DataBase.");
                }
            });
            res.redirect("/")
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    });

});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;

    const item = new Item({
        name: itemName
    });

    item.save();

    res.redirect("/")

});


app.get("/about", function (req, res) {
    res.render("about");
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
            console.log(err);
            res.redirect("/");
        } else {
            console.log("Successfully removed Document from Database");
        }
    })
});

app.get("/:customListName", function (req, res) {
    const customListName = req.params.customListName;

    List.findOne({
        name: customListName
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // * Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });


                list.save();
                res.redirect("/" + customListName);
            } else {
                // * Show an existing List

                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });

            }
        }
    });
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
})