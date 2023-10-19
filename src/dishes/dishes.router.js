const router = require("express").Router();
const controller = require("./dishes.controller")
const methodNotAllowed = require("../errors/methodNotAllowed")
// TODO: Implement the /dishes routes needed to make the tests pass



router.route("/")
.get(controller.list) // List function from controller file 
.post(controller.create)

router.route("/:dishId")
.get(controller.read)
.put(controller.update)
.all(methodNotAllowed)


module.exports = router;
