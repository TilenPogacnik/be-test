const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { getProfile } = require("../middleware/getProfile");
const { getAllPaidJobsInTimeRange } = require("../controllers/jobController");
const { getBestClients } = require("../controllers/profileController");

router.get(
  "/best-profession",
  getProfile,
  asyncHandler(async (req, res) => {
    const { start, end } = req.query;

    //TODO: It would be better to supply a default date range (e.g. now and 1970-01-01) if no dates are supplied
    if (!start || !end) {
      return res.status(400).json({ error: "start and end date required" });
    }
    if (isNaN(new Date(start)) || isNaN(new Date(end))) {
      return res.status(400).json({ error: "invalid date" });
    }

    if (new Date(start) > new Date(end)) {
      return res
        .status(400)
        .json({ error: "start date must be before end date" });
    }

    const paidJobs = await getAllPaidJobsInTimeRange(start, end);

    if (paidJobs.length === 0) {
      return res.status(400).json({ error: "no jobs found in date range" });
    }

    const earnings = new Map();
    paidJobs.forEach((job) => {
      const profession = job.Contract.Contractor.profession;
      earnings.set(
        profession,
        (earnings.has(profession) ? earnings.get(profession) : 0) + job.price
      );
    });

    const bestProfession = [...earnings.entries()].reduce(
      (best, current) => (current[1] > best[1] ? current : best),
      ["", 0]
    );

    res.json({ profession: bestProfession[0] });
  })
);

router.get(
  "/best-clients",
  getProfile,
  asyncHandler(async (req, res) => {
    const { start, end } = req.query;

    const limit = req.query.limit ? parseInt(req.query.limit) : 2;

    //TODO: It would be better to supply a default date range (e.g. now and 1970-01-01) if no dates are supplied
    if (!start || !end) {
      return res.status(400).json({ error: "start and end date required" });
    }
    if (isNaN(new Date(start)) || isNaN(new Date(end))) {
      return res.status(400).json({ error: "invalid date" });
    }

    if (new Date(start) > new Date(end)) {
      return res
        .status(400)
        .json({ error: "start date must be before end date" });
    }

    const clients = await getBestClients(start, end, limit);
    res.json(clients);
  })
);

module.exports = router;
