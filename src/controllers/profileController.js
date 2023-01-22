const { Profile, Contract, Job, sequelize } = require("../model");
const { Op } = require("sequelize");

const depositMoney = async (profileId, amount) => {
  const profile = await Profile.findByPk(profileId);
  profile.balance += amount;
  await profile.save();
  return profile;
};

const getBestClients = async (start, end, limit) => {
  const result = await Job.findAll({
    attributes: [[sequelize.fn("sum", sequelize.col("price")), "paid"]],
    order: [["paid", "DESC"]],
    group: ["Contract.ClientId"],
    limit,
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
            as: "Client",
            attributes: ["firstName", "lastName", "id"],
            where: {
              type: "client",
            },
          },
        ],
      },
    ],
  });

  return result.map((r) => {
    return {
      id: r.Contract.Client.id,
      fullName: r.Contract.Client.firstName + " " + r.Contract.Client.lastName,
      paid: r.paid,
    };
  });
};

module.exports = { depositMoney, getBestClients };
