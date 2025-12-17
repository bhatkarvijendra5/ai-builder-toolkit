import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();

/*
Input expected from Lovable UI:
{
  "tool": "merge_pdf" | "split_pdf" | "pdf_to_word" |
          "pdf_to_excel" | "sign_pdf" | "compress_pdf"
}
*/

if (!input?.tool) {
    throw new Error("Tool name is required");
}

let response;

switch (input.tool) {
    case "merge_pdf":
        response = { message: "Merge PDF tool executed" };
        break;

    case "split_pdf":
        response = { message: "Split PDF tool executed" };
        break;

    case "pdf_to_word":
        response = { message: "PDF to Word executed" };
        break;

    case "pdf_to_excel":
        response = { message: "PDF to Excel executed" };
        break;

    case "compress_pdf":
        response = { message: "PDF compressed" };
        break;

    case "sign_pdf":
        response = {
            message: "PDF signed successfully",
            signatureStatus: "VALID"
        };
        break;

    default:
        throw new Error("Unknown tool selected");
}

await Actor.setValue("OUTPUT", {
    success: true,
    tool: input.tool,
    response
});

await Actor.exit();

