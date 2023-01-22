const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { getProfile } = require("../middleware/getProfile");
const { getUnpaidJobs } = require("../controllers/jobController");
const { Job, Contract, Profile, sequelize } = require("../model");

router.get(
  "/unpaid",
  getProfile,
  asyncHandler(async (req, res) => {
    const jobs = await getUnpaidJobs(req.profile.id);
    res.json(jobs);
  })
);

router.post(
  "/:id/pay",
  getProfile,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const job = await Job.findByPk(id, {
      include: [{ model: Contract }],
    });
    if (!job) return res.status(404).end();

    if (job.Contract.ClientId !== req.profile.id) return res.status(403).end();
    if (job.paid) return res.status(409).end();

    const client = await Profile.findByPk(req.profile.id);
    if (client.balance < job.price) return res.status(400).end();

    const contractor = await Profile.findByPk(job.Contract.ContractorId);

    const result = await sequelize.transaction(async (t) => {
      client.balance -= job.price;
      contractor.balance += job.price;
      job.paid = true;
      job.paymentDate = new Date();

      await client.save({ transaction: t });
      await contractor.save({ transaction: t });
      await job.save({ transaction: t });

      return job;
    });

    res.json(result);
  })
);

module.exports = router;
