const router = require("express").Router();
const {
  getContractById,
  getAllNonTerminatedContracts,
} = require("../controllers/contractController");
const { getProfile } = require("../middleware/getProfile");

/**
 * @returns contract by id
 */
router.get("/:id", getProfile, async (req, res) => {
  const { id } = req.params;
  const contract = await getContractById(id, req.profile.id);

  if (!contract) return res.status(404).end();
  res.json(contract);
});

router.get("/", getProfile, async (req, res) => {
  const contracts = await getAllNonTerminatedContracts(req.profile.id);
  res.json(contracts);
});

module.exports = router;
