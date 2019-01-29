var mysql = require('mysql');
var inquirer = require('inquirer');
var connection  = require('./keys.js');

connection.connect(function(err) {
    if (err) throw err;
    readProducts();
});

function buyItem() {
    connection.query("SELECT * FROM PRODUCTS WHERE stock_quantity > 0", function(err, results) {
        if (err) throw err;
        
        inquirer.prompt([
            {
                name: "choice",
                type: "list",
                choices: function() {
                    var choiceArray = [];
                    for (var i=0; i < results.length; i++) {
                        choiceArray.push(results[i].product_name);
                    }
                    return choiceArray;
                },
                message: "Which Item Would You Like To Purchase?"
            },
            {
                name: "quantity",
                type: "input",
                message: "How Many Would You Like?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function(answer) {
            var chosenItem;
            for (var i=0; i < results.length; i++) {
                if (results[i].product_name === answer.choice) {
                    chosenItem = results[i];
                }
            }
            if (chosenItem.stock_quantity >= parseInt(answer.quantity)) {
                var newQuantity = parseInt(chosenItem.stock_quantity) - parseInt(answer.quantity);
                var totalPrice = parseFloat(chosenItem.price) * answer.quantity;
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: newQuantity,
                        },
                        {
                            item_id: chosenItem.item_id
                        }
                    ],
                    function(error) {
                        if (error) throw error;
                        console.log("Thank you for shopping! You're total is $" + totalPrice);
                        moreShopping();
                    }
                );
            }
            else {
                console.log("I'm sorry, we only have "+chosenItem.stock_quantity+" available.\n")
                moreShopping();
            }
        });
    });
};

function moreShopping() {
    inquirer.prompt([
        {
            name:"again",
            type: "confirm",
            message: "Would you like to continue shopping?\n"
        }
    ])
    .then(function(answer) {
        if(answer.again) {
            readProducts();
        }
        else {
            console.log("Thank you for shopping at Bamazon! Please come again.\n");
            connection.end();
        }
    });
};

function readProducts() {
	connection.query("SELECT * FROM products WHERE stock_quantity > 0", function(err, res) {
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
	});
	buyItem();
}