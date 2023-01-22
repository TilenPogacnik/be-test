const { Contract } = require("../model");
const { Op } = require("sequelize");

const getContractById = async (id, profileId) => {
  return Contract.scope({ method: ["by_profile", profileId] }).findOne({
    where: {
      id,
    },
  });
};

const getAllNonTerminatedContracts = async (profileId) => {
  return Contract.scope({ method: ["by_profile", profileId] }).findAll({
    where: {
      status: { [Op.ne]: "terminated" },
    },
  });
};

module.exports = { getContractById, getAllNonTerminatedContracts };
