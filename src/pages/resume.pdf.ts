import type { APIRoute } from "astro";
import { spawn } from "child_process";
import resume from "../content/resume.typ?raw";

export const GET: APIRoute = () => {
    return new Promise((resolve) => {
        const child = spawn("typst", ["compile", "--format=pdf", "-", "-"]);

        const chunks: Buffer[] = [];
        let stderr = "";

        child.stdout.on("data", (chunk) => chunks.push(chunk));
        child.stderr.on("data", (chunk) => (stderr += chunk.toString()));

        child.on("close", (code) => {
            if (code !== 0) {
                resolve(new Response(`Typst compilation failed: ${stderr}`, { status: 500 }));
            } else {
                resolve(
                    new Response(Buffer.concat(chunks), {
                        headers: {
                            "Content-Type": "application/pdf",
                            "Content-Disposition": "inline; filename=resume.pdf",
                        },
                    }),
                );
            }
        });

        child.stdin.write(resume);
        child.stdin.end();
    });
};
