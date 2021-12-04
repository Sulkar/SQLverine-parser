
import {
  SqlVerineEditor
} from "../../SQLverine/src/SqlVerineEditor"
import { parse } from "./sqlverine.pegjs";

//load JSON SQL Queries
let jsonData;
let currentStmt = "SELECT";
let currentQueryNr = 0;
let currentStmtGroup = 0;
fetch("./data/SqlQueries.json")
  .then(response => response.json()).then(data => {
    jsonData = data;
    addQueryToTextarea(jsonData.start[currentStmtGroup].queries[currentQueryNr].query)
    setQueryNrToInput(currentQueryNr);
    fillSelectWithStmtGroups();
  })


const inputTextarea = document.querySelector('#sqlToParseTextarea');
const outputParsedObjectTextarea = document.querySelector('#outputParsedObjectTextarea');
const outputDiv = document.querySelector('#sqlParserOutputHTML');
const inputQueryNr = document.querySelector('#inputQueryNr');

//Function:
function addQueryToTextarea(query) {
  inputTextarea.value = query;
}
//Function:
function setQueryNrToInput(number) {
  inputQueryNr.value = number;
}
//Function:
function fillSelectWithStmtGroups() {
  const select = document.getElementById("selectStmtGrp");
  //jsonData.start[currentStmtGroup].queries[currentQueryNr].query
  jsonData.start.forEach((stmtGroup, index) => {
    let option = document.createElement("option");
    option.value = index;
    option.text = stmtGroup.name;
    select.add(option);
  });
}
//Function:
function parseAll(stmtGroup) {
  currentStmtGroup = stmtGroup;
  currentQueryNr = 0;
  let outputAstArray = [];
  let counter = 0;
  const currentStmtGroupQueries = jsonData.start[currentStmtGroup].queries;
  outputParsedObjectTextarea.classList.remove("errorColor");
  currentStmtGroupQueries.forEach(query => {
    try {
      counter++;
      outputAstArray.push("---------- Query Nr.: " + (counter - 1) + " ----------");
      outputAstArray.push(parse(query.query));
    } catch (error) {
      outputParsedObjectTextarea.classList.add("errorColor");
      outputParsedObjectTextarea.value = "Fehler beim Parsen des Queries Nr.: " + (counter - 1) + ".\nSiehe Konsole für weitere Informationen.\n\n";
      outputParsedObjectTextarea.value += JSON.stringify(error, null, 4);
      console.log(error);
    }

  })
  if (outputAstArray.length == (counter * 2)) { //Da pro erfolgreichem Durchlauf zwei Elemente dem Array hinzugefügt werden.
    outputParsedObjectTextarea.classList.remove("errorColor");
    outputParsedObjectTextarea.value = "Es wurden alle " + (counter) + " Queries ohne Fehler geparst.\nSiehe Konsole für weitere Informationen.\n\n";
    outputParsedObjectTextarea.value += JSON.stringify(outputAstArray, null, 4);
  }
  console.log(outputAstArray);
}

//Select: Select Stmt Group
document.querySelector('#selectStmtGrp').addEventListener("change", function () {
  currentStmtGroup = this.value;
  currentQueryNr = 0;
  addQueryToTextarea(jsonData.start[currentStmtGroup].queries[currentQueryNr].query)
  setQueryNrToInput(currentQueryNr);
});

//Button: nextQuery
document.querySelector('#btnNextQuery').addEventListener("click", function () {
  if (jsonData.start[currentStmtGroup].queries.length - 1 > currentQueryNr) currentQueryNr++;
  else currentQueryNr = 0;
  addQueryToTextarea(jsonData.start[currentStmtGroup].queries[currentQueryNr].query);
  setQueryNrToInput(currentQueryNr);
});

//Button: prevQuery
document.querySelector('#btnPrevQuery').addEventListener("click", function () {
  if (currentQueryNr > 0) currentQueryNr--;
  else currentQueryNr = jsonData.start[currentStmtGroup].queries.length - 1;
  addQueryToTextarea(jsonData.start[currentStmtGroup].queries[currentQueryNr].query);
  setQueryNrToInput(currentQueryNr);
});

//Button: findQuery
document.querySelector('#btnFindQuery').addEventListener("click", function () {
  currentQueryNr = inputQueryNr.value;
  addQueryToTextarea(jsonData.start[currentStmtGroup].queries[currentQueryNr].query);
});

//Button: parse Textarea nach DIV
document.querySelector('#btnParse').addEventListener("click", function () {
  outputParsedObjectTextarea.classList.remove("errorColor");
  try {
    //Zu parsender String wird aus der Textarea kopiert.
    let zuParsenderString = inputTextarea.value.trim();
    //Ein AST Objekt wird mit Hilfe des PEG.js Parsers erstellt
    let outputAST = parse(zuParsenderString);
    //Das AST Objekt wird in eine formatierte Zeichenkette umgewandelt und in einer Textarea angezeigt.
    const outputAstStringify = JSON.stringify(outputAST, null, 4);
    outputParsedObjectTextarea.value = outputAstStringify;

    //TODO: AST Objekt in SQLverine Codeblöcke umwandeln
    astToSqlVerine(outputAST)
  } catch (error) {
    outputParsedObjectTextarea.classList.add("errorColor");
    outputParsedObjectTextarea.value = "Fehler beim Parsen des Queries.\nSiehe Konsole für weitere Informationen.\n\n";
    outputParsedObjectTextarea.value += JSON.stringify(error, null, 4);
    console.log(error);
  }
});

//Button: parse Textarea nach DIV
document.querySelector('#btnParseAll').addEventListener("click", function () {
  parseAll(currentStmtGroup);
});


/* 
  In eigene Klasse: AstToSqlVerine.js auslagern.
*/
function astToSqlVerine(ast) {
  ast.forEach(element => {
    if (element.type == "SELECT") {
      createSelect(element);
    } else if (element.type == "WHERE") {
      console.log("createWhere");
    } //...

  });

}

function createSelect(selectAst) {
  let from = selectAst.from;
  let columns = selectAst.columns;
  columns.forEach(column => {

    column.forEach((item, index) => {
      if (item.type == "COLUMN") {
        console.log("Column: " + item.column);
      } else if (item.type == "AS") {
        console.log("AS new column: " + item.columns.column);
      } else if (item.type == "AGGREGAT") {
        console.log("Aggregat: " + item.aggregat);
        console.log("Aggregat Column: " + item.columns.column);
      }
    });

  });
  console.log("Table: " + from.column);
}