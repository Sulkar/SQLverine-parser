
import {
  SqlVerineEditor
} from "../../SQLverine/src/SqlVerineEditor"
import { parse } from "./sqlverine.pegjs";

const inputTextarea = document.querySelector('#sqlToParseTextarea');
const outputParsedObjectTextarea = document.querySelector('#outputParsedObjectTextarea');
const outputDiv = document.querySelector('#sqlParserOutputHTML');


//tests
inputTextarea.value = "SELECT id, vorname AS 'Rufname', MAX(geburtsdatum) FROM schueler";

//parse Textarea nach DIV
document.querySelector('#btnParse').addEventListener("click", function () {
    //Zu parsender String wird aus der Textarea kopiert.
    let zuParsenderString = inputTextarea.value.trim();
    //Ein AST Objekt wird mit Hilfe des PEG.js Parsers erstellt
    let outputAST = parse(zuParsenderString);
    //Das AST Objekt wird in eine formatierte Zeichenkette umgewandelt und in einer Textarea angezeigt.
    const outputAstStringify =  JSON.stringify(outputAST, null, 4);
    outputParsedObjectTextarea.value = outputAstStringify;
    console.log(outputAST);

    //TODO: AST Objekt in SQLverine Codeblöcke umwandeln
    checkAst(outputAST)
});


function checkAst(ast){
  ast.forEach(element => {
    if(element.type == "SELECT"){
      createSelect(element);
    }else if(element.type == "WHERE"){
      console.log("createWhere");
    } //...

  });

}

function createSelect(selectAst){
  let from = selectAst.from;
  let columns = selectAst.columns;
  columns.forEach(column => {

    column.forEach((item, index) =>{
      if(item.type == "COLUMN"){
        console.log("Column: " + item.column);
      }else if(item.type == "AS"){
        console.log("AS new column: " + item.columns.column);
      }else if(item.type == "AGGREGAT"){
        console.log("Aggregat: " + item.aggregat);
        console.log("Aggregat Column: " + item.columns.column);
      }
    });

  });
  console.log("Table: " + from.column);
}