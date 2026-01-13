import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  if (
    !req.body.projectName ||
    !req.body.billingEntity ||
    !req.body.address ||
    !req.body.fee ||
    !req.body.proposedMandates ||
    !req.body.clientEmail ||
    !req.body.clientName ||
    !req.body.clientCompanyAddress ||
    !req.body.assetClass ||
    !req.body.projectDescription
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  return res.send('ok');
});

export default router;
