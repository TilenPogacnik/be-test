const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { getTotalUnpaidAmount } = require("../controllers/jobController");
const { depositMoney } = require("../controllers/profileController");
const { getProfile } = require("../middleware/getProfile");

router.post(
  "/deposit/:id",
  getProfile,
  asyncHandler(async (req, res) => {
    clientId = req.params.id;
    const { amount } = req.body;

    if (!amount || isNaN(amount)) return res.status(400).end();
    if (req.profile.id !== +clientId) return res.status(403).end();
    if (req.profile.type !== "client") return res.status(403).end();

    //TODO: clarify it with the team -> should we really cap deposit amount to 25% of total amount to pay?
    const totalAmountToPay = await getTotalUnpaidAmount(clientId);
    if (amount > totalAmountToPay * 0.25) return res.status(400).end();

    const updatedProfile = await depositMoney(clientId, amount);
    res.json(updatedProfile);
  })
);

module.exports = router;
