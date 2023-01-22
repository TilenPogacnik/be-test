const { Op } = require("sequelize");
const { Job, Contract, Profile } = require("../model");

const getUnpaidJobs = async (profileId) => {
  return Job.findAll({
    where: {
      paid: { [Op.not]: true },
    },
    include: [
      {
        model: Contract.scope({ method: ["by_profile", profileId] }),
        attributes: [],
        where: {
          status: "in_progress",
        },
      },
    ],
  });
};

const getTotalUnpaidAmount = async (clientId) => {
  return Job.sum("price", {
    where: {
      paid: { [Op.not]: true },
    },
    include: [
      {
        model: Contract,
        attributes: [],
        where: {
          status: "in_progress",
          ClientId: clientId,
        },
      },
    ],
  });
};

const getAllPaidJobsInTimeRange = async (start, end) => {
  return Job.findAll({
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [start, end],
      },
    },
    include: [
      {
        model: Contract,
        attributes: ["id"],
        include: [
          {
            model: Profile,
            as: "Contractor",
            where: {
              type: "contractor",
            },
            attributes: ["profession"],
          },
        ],
      },
    ],
  });
};

module.exports = {
  getUnpaidJobs,
  getTotalUnpaidAmount,
  getAllPaidJobsInTimeRange,
};
