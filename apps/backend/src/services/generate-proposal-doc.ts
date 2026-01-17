import type { GenerateProposalPayload } from "@shared/types/proposal";
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type { Request, Response } from 'express';
import pool from "../utils/db";

type BioEntry = {
    name: string;
    industry_experience: string;
    accreditations: string | null;
};

export async function generateProposalDocx(req: Request, res: Response) {
    console.log("--> RECEIVED REQUEST generateProposalDocx", req.body);
    try {
        const {
            projectName,
            address,
            clientName,
            clientEmail,
            date,
            bios,
            listOfServices
        }: GenerateProposalPayload = req.body;

        // Fetch bios from DB based on IDs
        let biosData: BioEntry[] = [];
        if (bios && bios.length > 0) {
            const result = await pool.query(
                "SELECT name, industry_experience, accreditations FROM pg_bios WHERE id = ANY($1)",
                [bios]
            );
            biosData = result.rows.map(b => ({
                name: b.name,
                industry_experience: b.industry_experience,
                accreditations: b.accreditations || null,
            }));
        }

        const selectedServices = new Set(listOfServices || []);
        const serviceFlags = {
            has_concept_to_completion: selectedServices.has('concept_to_completion'),
            has_cost_planning: selectedServices.has('cost_planning'),
            has_project_monitoring: selectedServices.has('project_monitoring'),
        };

        const templatePath = path.resolve(__dirname, "..", "..", "proposal-template.docx");

        const PAGE_BREAK_XML =
            `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

        console.log("Loading template from:", templatePath);
        if (!fs.existsSync(templatePath)) {
            console.error("Template not found at:", templatePath);
            return res.status(500).json({
                message: "Template file not found",
                templatePath,
            });
        }

        const templateBuf = fs.readFileSync(templatePath);
        console.log("Template loaded successfully, size:", templateBuf.length);

        const zip = new PizZip(templateBuf);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            // Add this option to help with debugging
            nullGetter: () => {
                return "";
            }
        });

        const templateData = {
            project_name: projectName,
            client_name: clientName,
            client_email: clientEmail,
            date: date || new Date().toISOString(),
            address: address,
            bios: biosData,
            ...serviceFlags,
            has_concept_to_completion_break: serviceFlags.has_concept_to_completion
                ? PAGE_BREAK_XML
                : "",
            has_cost_planning_break: serviceFlags.has_cost_planning ? PAGE_BREAK_XML : "",
            has_project_monitoring_break: serviceFlags.has_project_monitoring
                ? PAGE_BREAK_XML
                : "",
        };

        console.log('Template data being sent:', JSON.stringify(templateData, null, 2));

        // Render the document
        doc.render(templateData);

        console.log("Template rendered successfully");

        // Generate the output buffer
        const out = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE"
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="proposal-${projectName.replace(/[^a-z0-9]/gi, '_')}.docx"`
        );
        res.send(out);

    } catch (err: any) {
        console.error("CRITICAL ERROR in generateProposalDocx:", err);

        // Better error logging for docxtemplater errors
        if (err.properties && err.properties.errors) {
            console.error("Docxtemplater errors:", JSON.stringify(err.properties.errors, null, 2));
        }

        return res.status(500).json({
            error: "Service Error",
            message: err?.message ?? String(err),
            stack: err?.stack,
            properties: err?.properties
        });
    }
}
