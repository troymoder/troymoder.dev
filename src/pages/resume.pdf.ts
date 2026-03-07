import type { APIRoute } from "astro";
import { execSync } from "child_process";
import { readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export const GET: APIRoute = async () => {
    const typFile = join(process.cwd(), "src/content/resume.typ");
    const outFile = join(tmpdir(), `resume-${Date.now()}.pdf`);

    try {
        execSync(`typst compile ${typFile} ${outFile}`, { stdio: "pipe" });
        const pdf = readFileSync(outFile);
        unlinkSync(outFile);

        return new Response(pdf, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline; filename=resume.pdf",
            },
        });
    } catch (e) {
        return new Response(`Typst compilation failed: ${e}`, { status: 500 });
    }
};
