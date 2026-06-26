const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

async function extractText(filePath){

    const data = new Uint8Array(fs.readFileSync(filePath));

    const pdf = await pdfjsLib.getDocument({
        data
    }).promise;

    let text="";

    for(let i=1;i<=pdf.numPages;i++){

        const page=await pdf.getPage(i);

        const content=await page.getTextContent();

        text+=content.items
        .map(item=>item.str)
        .join(" ")
        .replace(/\s+/g," ")
        .trim();

        text+="\n";

    }

    return text.trim();

}

module.exports={
    extractText
};