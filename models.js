const { Sequelize } = require("sequelize");

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    define: {
      underscored: true,
    },
  });
} else {
  sequelize = new Sequelize({
    database: "sf_back",
    dialect: "postgres",
    define: {
      underscored: true,
    },
  });
}

class Post extends Sequelize.Model {}

Post.init(
  {
    title: Sequelize.STRING,
    mix: Sequelize.STRING,
    likes: Sequelize.ARRAY(Sequelize.TEXT),
  },
  {
    sequelize,
    modelName: "post",
  }
);

class User extends Sequelize.Model {}

User.init(
  {
    username: Sequelize.STRING,
    password_digest: Sequelize.STRING,
    email: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: "user",
  }
);

class Comment extends Sequelize.Model {}

Comment.init(
  {
    comment: Sequelize.STRING,
  },
  {
    sequelize,
    modelName: "comment",
  }
);

User.hasMany(Post, { onDelete: "cascade" });
Post.belongsTo(User);
User.hasMany(Comment, { onDelete: "cascade" });
Post.hasMany(Comment, { onDelete: "cascade" });
Comment.belongsTo(Post);
Comment.belongsTo(User);

module.exports = {
  Post,
  User,
  Comment,
  sequelize,
};
