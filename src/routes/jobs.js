const router = require("express").Router();
const { getProfile } = require("../middleware/getProfile");
const { getUnpaidJobs } = require("../controllers/jobController");

router.get("/unpaid", getProfile, async (req, res) => {
  const jobs = await getUnpaidJobs(req.profile.id);
  res.json(jobs);
});

module.exports = router;
