import { Router } from "express";
import { generateProposalDocx } from "../services/generate-proposal-doc";

const router = Router();

router.post("/", async (req, res) => {
  // if (
  //   !req.body.projectName ||
  //   !req.body.billingEntity ||
  //   !req.body.address ||
  //   !req.body.fee ||
  //   !req.body.proposedMandates ||
  //   !req.body.clientEmail ||
  //   !req.body.clientName ||
  //   !req.body.clientCompanyAddress ||
  //   !req.body.assetClass ||
  //   !req.body.projectDescription
  // ) {
  //   return res.status(400).json({ error: "Missing required fields" });
  // }

  console.log(req.body);

  try {
    await generateProposalDocx(req, res);
  } catch (e: any) {
    console.error("Proposal Generation Error:", e);
    return res.status(500).json({
      error: "Failed to generate proposal",
      message: e?.message || String(e)
    });
  }
});

export default router;
