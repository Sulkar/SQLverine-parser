
import {
  SqlVerineEditor
} from "../../SQLverine/src/SqlVerineEditor"
import { parse } from "./sqlverine.pegjs";

const inputTextarea = document.querySelector('#sqlToParseTextarea');
const outputParsedObjectTextarea = document.querySelector('#outputParsedObjectTextarea');
const outputDiv = document.querySelector('#sqlParserOutputHTML');


//tests
inputTextarea.value = "SELECT name FROM schueler WHERE id = 5 AND name = 'Richi'";

//parse Textarea nach DIV
document.querySelector('#btnParse').addEventListener("click", function () {
    //Zu parsender String wird aus der Textarea kopiert.
    let zuParsenderString = inputTextarea.value;
    //Ein AST Objekt wird mit Hilfe des PEG.js Parsers erstellt
    let outputAST = parse(zuParsenderString);
    //Das AST Objekt wird in eine formatierte Zeichenkette umgewandelt und in einer Textarea angezeigt.
    const outputAstStringify =  JSON.stringify(outputAST, null, 4);
    outputParsedObjectTextarea.value = outputAstStringify;
    console.log(outputAST);

    //TODO: AST Objekt in SQLverine Codeblöcke umwandeln

});