var mysql = require('mysql');
var inquirer = require('inquirer');
var connection = require('./keys.js');

listOptions();

function listOptions() {
    inquirer.prompt(
        {
            name: "choice",
            type: "list",
            choices:["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "End"],
            message: "What would you like to do?"
        }
    ).then(options => {
        switch(true){
            case options.choice === "View Products for Sale":
            viewProducts();
            break;

            case options.choice === "View Low Inventory":
            viewProducts(true);
            break;

            case options.choice === "Add to Inventory":
            addInventory();
            break;


            case options.choice === "Add New Product":
            addNewProduct();
            break;

            case options.choice === "End":
            console.log("Have a nice day!");
            connection.end();
            break;

            default:
        };

    });
}

function viewProducts(low) {
    var q = "SELECT * FROM products";
    if (low) {
        q = "SELECT * FROM products WHERE stock_quantity < 2"
    }
    connection.query(q, function(err, res) {
        if (err) throw err;
		console.log("+----+------------------------------------------+------------------+----------+");
		console.log("|  # | NAME                                     | DEPARTMENT       | PRICE    |");
		console.log("+----+------------------------------------------+------------------+----------+");
		for (let i = 0; i < res.length; i++) {
			let item_id = res[i].item_id.toString();
			let product_name = res[i].product_name;
			let department_name = res[i].department_name;
			let price = "$" + res[i].price;
			while(item_id.length < 2) {
				item_id = " " + item_id;
			}
			while(product_name.length < 40) {
				product_name = product_name + " ";
			}
			while(department_name.length < 16) {
				department_name = department_name + " ";
			}
			while(price.length < 8) {
				price = " " + price;
			}
			console.log("| " + item_id + " | " + product_name + " | " + department_name + " | " + price + " |");
		}
		console.log("+----+------------------------------------------+------------------+----------+\n");
        listOptions();    
    });
}

function addInventory() {
	connection.query("SELECT * FROM products", function(err, results) {
		if (err) throw err;
		inquirer.prompt([
			{
				name: "choice",
				type: "list",
				choices: function() {
					var choiceArray = [];
					for (var i = 0; i < results.length; i++) {
						choiceArray.push(results[i].product_name);
					}
					return choiceArray;
				},
				message: "What item would you like to add more of?"
			},
			{
				name: "quantity",
				type: "input",
				message: "How many more should be ordered?"
			}
		])
		.then(function(answer) {
			var chosenItem;
			for (var i = 0; i < results.length; i++) {
				if (results[i].product_name === answer.choice) {
					chosenItem = results[i];
				}
			}
			var newQuantity = parseInt(chosenItem.stock_quantity) + parseInt(answer.quantity);
			connection.query(
				"UPDATE products SET ? WHERE ?",
				[
					{
						stock_quantity: newQuantity
					},
					{
						item_id: chosenItem.item_id
					}
				],
				function(error) {
					if (error) throw err;
					console.log("You have added " + answer.quantity + " units. You now have " + newQuantity + ".");
					listOptions();
				}
			);
		});
	});
}


function addNewProduct() {
    connection.query("SELECT department_name from products", function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "product_name",
                type: "input",
                message: "What product are we adding?"
            },
            {
                name: "department_name",
                type: "list",
                choices: function () {
                    var choiceArray = [];
                    for (i=0; i < results.length; i++) {
                        choiceArray.push(results[i].department_name);
                    }
                    return choiceArray;
                },
                message: "Which department does this belong to?"
            },
            {
                name: "price",
                type: "input",
                message: "Please enter a price for this item.",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "stock_quantity",
                type: "input",
                message: "How many did we order?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function(answer){
            connection.query(
                "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + answer.product_name + "', '" + answer.department_name + "', '" + answer.price + "', '" + answer.stock_quantity + "')",
                 function (error) {
                     console.log(error);
                     throw error;
                 },
                 console.log("You have added " + answer.stock_quantity + " units of " + answer.product_name + "."));
                 listOptions();
            }
        );
    
        });
}