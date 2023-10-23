const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));


// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


//Validations functions

//Validation for ID matching the router ID

function idMatches(req, res, next) {

    const { orderId } = req.params;
    const { data: { id } = {} } = req.body;

    if (id && id !== orderId) {
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${orderId}`
        })
    } else {
        return next()
    }

}

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

function orderExists(req, res, next) {

    const { orderId } = req.params
    const foundOrder = orders.find(order => order.id === orderId)

    if (foundOrder) {

        res.locals.order = foundOrder
        return next()
    }

    next({
        status: 404, message: `Order id not found ${orderId}`
    })



}

// Function to check that the order status is valid


function statusIsValid(req, res, next) {

    const order = res.locals.order
    
    const {data:{status}={}} =req.body
    
    if(status !== 'pending' && status !== 'preparing' && status !== 'out-for-delivery') {
        return next({ status: 400, message: 'The order status must either be pending, preparing or out-for-delivery' })
    
  }
    
    next()
  
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

function read(req, res, next) {

    res.json({ data: res.locals.order })
}

//Function to UPDATE/PUT a soecific dish by ID (/dishes/:dishId)

function update(req, res, next) {

    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;


    let order = res.locals.order


    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.status = status
    order.dishes = dishes

    res.json({ data: order })


}



// Function to DELETE an order 

function destroy(req,res,next){

    const {orderId} = req.params;
    const index = orders.findIndex(order => order.id === orderId)

    const order = res.locals.order

    if(order.status === 'pending'){
        if(index > -1){
            orders.splice(index,1)
        }
        res.sendStatus(204)
    }else{
        next({
            status:400, message:"An order cannot be deleted unless itis pending."
        })
    }

   
}



module.exports = {
    list,
    create: [bodyDataHas("deliverTo"), bodyDataHas("mobileNumber"), bodyDataHas("dishes"), dishesAreValid, dishesQuantity, create],
    read: [orderExists, read],
    update: [orderExists, bodyDataHas("deliverTo"), bodyDataHas("mobileNumber"), bodyDataHas("dishes"), bodyDataHas("status"),dishesAreValid, dishesQuantity, idMatches,statusIsValid, update],
    delete:[orderExists,destroy]
}