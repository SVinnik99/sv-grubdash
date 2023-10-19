const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


//Validation functions, return a status 400 and an error message if validation fails

//Validation for 'name' property, cannot be missing or empty  -- done
//Validation for 'description' property, cannot be missing or empty -- done
//Validation for image_url, property has to exist and cannot be empty --done
//Validation for 'price' property, cannot be missing or empty --done

function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next()
        }
        next({
            status: 400,
            message: `Must include a ${propertyName}`
        })
    }
}

// Validation for price, cannot be equal to or less than 0, and has to be a number  --done

function validatePrice(req, res, next) {
    const { data: { price } = {} } = req.body;

    if (price > 0 && typeof price === 'number') {
        return next()
    }
    next({
        status: 400,
        message: `Price must be a number, and greater than 0.`
    })
}

// Validation for making sure the ID exists

function idExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId)

    if (foundDish) {
        res.locals.dish = foundDish;
        return next()
    }
    next({
        status: 404, message: `Dish does not exist: ${dishId}.`
    })
}


//###################################################################


// Function to LIST/GET dishes  (/dishes)

function list(req, res, next) {
    res.json({ data: dishes })
}

// Function to CREATE/POST dishes (/dishes)

function create(req, res, next) {

    const { data: { name, description, price, image_url } = {} } = req.body;

    const newDish = {
        id: nextId,
        name: name,
        description: description,
        price: price,
        image_url: image_url
    }

    dishes.push(newDish)
    res.json({ data: newDish })
}

// Function to READ a specific dish by its ID (/dishes/:dishId)

function read(req, res, next) {

    res.json({data:res.locals.dish})
}

module.exports = {
    list,
    create: [validatePrice, bodyDataHas("name"), bodyDataHas("description"), bodyDataHas("price"), bodyDataHas("image_url"), create],
    read:[idExists,read]
}