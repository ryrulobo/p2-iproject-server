const router = require("express").Router();
const PostController = require("../controllers/post");
const { postAuthz } = require("../middlewares/authz");

router.post("/", PostController.add);
router.get("/", PostController.posts);
router.get("/:id", PostController.post);
router.put("/:id", postAuthz, PostController.edit);

module.exports = router;
