const { Profile } = require("../model");

const depositMoney = async (profileId, amount) => {
  const profile = await Profile.findByPk(profileId);
  profile.balance += amount;
  await profile.save();
  return profile;
};

module.exports = { depositMoney };
