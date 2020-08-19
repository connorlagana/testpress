const { Router } = require("express");
const { User } = require("../models");
const {
  hashPassword,
  genToken,
  checkPassword,
  restrict,
} = require("../services/auth");

const userRouter = Router();

const buildAuthResponse = (user) => {
  const userData = {
    username: user.username,
    id: user.id,
  };

  const token = genToken(userData);

  return {
    user: userData,
    token,
  };
};

userRouter.get("/", async (req, res) => {
  try {
    const user = await User.findAll();
    res.json(user);
  } catch (e) {
    res.json({ error: e.message });
  }
});

userRouter.post("/register", async (req, res, next) => {
  try {
    const password_digest = await hashPassword(req.body.password);
    const user = await User.create({
      ...req.body,
      password_digest,
    });
    const respData = buildAuthResponse(user);
    res.json(respData);
  } catch (e) {
    res.json({ error: e.message });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (await checkPassword(req.body.password, user.password_digest)) {
      const respData = buildAuthResponse(user);

      res.json(respData);
    } else {
      res.status(401).send("Invalid Credentials");
    }
  } catch (e) {
    res.status(401).send("Invalid Credentials");
  }
});

userRouter
  .route("/:id")
  .get(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      res.json(user);
    } catch (e) {
      res.json({ error: e.message });
    }
  })
  .put(restrict, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      await user.update(req.body);
      res.json(user);
    } catch (e) {
      res.json({ error: e.message });
    }
  });

userRouter
  .route("/followers/:id")
  .get(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      res.json(user.followers);
    } catch (e) {
      res.json({ error: e.message });
    }
  })
  .put(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      let newFollowers = user.followers;
      const found = newFollowers.find(
        (element) => element === req.body.followers
      );
      console.log(found);
      if (found === undefined) {
        newFollowers.push(req.body.followers);
      } else {
        newFollowers = newFollowers.filter((element) => element !== found);
        console.log(newFollowers);
      }
      const unique = [...new Set(newFollowers)];
      await user.update({ followers: unique });
      res.json(user);
    } catch (e) {
      res.json({ error: e.message });
    }
  });

userRouter.get("/verify", restrict, (req, res) => {
  const user = res.locals.user;
  res.json(user);
});

module.exports = userRouter;
