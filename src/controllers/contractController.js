const { Contract } = require("../model");
const { Op } = require("sequelize");

const getContractById = async (id, profileId) => {
  return Contract.findOne({
    where: {
      id,
      [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
    },
  });
};

const getAllNonTerminatedContracts = async (profileId) => {
  return Contract.findAll({
    where: {
      status: { [Op.ne]: "terminated" },
      [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
    },
  });
};

module.exports = { getContractById, getAllNonTerminatedContracts };
