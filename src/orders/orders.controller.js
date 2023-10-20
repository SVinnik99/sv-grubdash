const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));


// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


//Validations functions


//Function to check for missing properties

function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body

        if (data[propertyName]) {
            return next()
        }
        next({
            status: 400,
            message: `Must include a ${propertyName} property.`
        })
    }
}

//Function to check the dishes property, cannot be empty and has to be an array

function dishesAreValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;

    if (dishes.length && Array.isArray(dishes)) {
        return next()
    }
    next({
        status: 400,
        message: `Order must include at least one dish.`
    })

}

//Function that checks the quantity in the dishes array, cannot be missing, equal to 0 or less, and must be integer
function dishesQuantity(req, res, next) {

    const { data: { dishes } = {} } = req.body;

    let foundDish = dishes.find((dish) => !dish.quantity || dish.quantity <= 0 || typeof dish.quantity !== 'number')

    let index = dishes.indexOf(foundDish)


    if (!foundDish) {
        return next()
    }

    next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`
    })


}

// Function to check that order exists

function orderExists(req,res,next){

    const {orderId} = req.params
    const foundOrder = orders.find(order => order.id === orderId)

    if(foundOrder){

        res.locals.order = foundOrder
        return next()
    }

    next({
        status:404, message: `Order id not found ${orderId}`
    })



}
//####################################################


// Function to LIST orders (/orders)

function list(req, res, next) {
    res.json({ data: orders })
}

// Function to CREATE/POST order (/orders)

function create(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    }

    orders.push(newOrder)
    res.status(201).json({ data: newOrder })

}

// Function to READ/GET a specific order by ID (/orders/:orderId)

function read(req,res,next){

    res.json({data:res.locals.order})
}



module.exports = {
    list,
    create: [bodyDataHas("deliverTo"), bodyDataHas("mobileNumber"), bodyDataHas("dishes"), dishesAreValid, dishesQuantity, create],
    read:[orderExists,read]
}