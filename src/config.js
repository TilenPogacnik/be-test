const sequelizeConfig = () => {
  const config = {
    dialect: "sqlite",
    storage: "./database.sqlite3",
    logging: false,
  };

  if (process.env.NODE_ENV === "test") {
    config.storage = ":memory:";
  }
  return config;
};

module.exports = { sequelizeConfig };
