import {
  SqlVerineEditor
} from "../../SQLverine/src/SqlVerineEditor"
import {
  parse
} from "./sqlverine.pegjs";

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
    const astToSql = new AstToSqlVerine(outputAST);
    astToSql.parseAst();

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


}

function createSelect(selectAst) {
  /* let from = selectAst.from;
   let columns = selectAst.columns;
   columns.forEach(column => {

     column.forEach((item, index) => {
       if (item.type == "COLUMN") {
         console.log("Column: " + item.value);
       } else if (item.type == "AS") {
         console.log("AS new column: " + item.columns.value);
       } else if (item.type == "AGGREGAT") {
         console.log("Aggregat: " + item.aggregat);
         console.log("Aggregat Column: " + item.columns.value);
       }
     });

   });
   console.log("Table: " + from.value);
   */
}

class AstToSqlVerine {
  constructor(ast) {
    this.ast = ast;
    this.htmlElementCount = 0;
    this.outputHTML = "";
    this.outputContainer = document.createElement("div");
  }

  parseAst() {
    this.ast.forEach(element => {
      switch (element.type) {

        case "SELECT":
          this.createSelect(element);
          break;

        default:
          console.log("Element of type " + element.type + " canot be parsed.");

      };
    });

    console.log(this.outputContainer.innerHTML);
  };

  createSelect(element) {

    const spanSelect = document.createElement("span");
    spanSelect.innerHTML = "SELECT";
    spanSelect.classList.add(this.getNextCodeElement(), "btnSelect", "synSQL", "sqlSelect", "start", "parent", "sqlIdentifier");
    spanSelect.setAttribute("data-sql-element", "SELECT");

    element.selectFields.forEach(selectField => {
      spanSelect.append(this.createLeerzeichen());
      switch (selectField.type) {

        case "COLUMN":
          spanSelect.append(this.createColumn(selectField));
          break;
        case "AS":

          break;
        case "AGGREGATE":

          break;
        case "STRING_FUNCTION":

          break;

        default:
          console.log("Selectfield of type " + selectField.type + " canot be parsed.");

      };

    });

    spanSelect.append(this.createLeerzeichen());

    const spanFrom = document.createElement("span");
    spanFrom.innerHTML ="FROM";
    spanFrom.classList.add(this.getNextCodeElement());    
    
    this.createTable(element, spanSelect);
    
    this.outputContainer.append(spanSelect);

  }

  createTable(element, htmlToAppend){
    htmlToAppend.append(this.createLeerzeichen());

    const spanFrom = document.createElement("span");
    spanFrom.innerHTML =element.from.value;
    spanFrom.classList.add(this.getNextCodeElement(),"selTable", "synTables", "inputField", "sqlIdentifier", "root");
    spanFrom.setAttribute("data-sql-element", "SELECT_FROM");  
    htmlToAppend.append(spanFrom);
  }

  createColumn(selectField){
    
    const spanColumn = document.createElement("span");

    spanColumn.innerHTML = selectField.value;
    spanColumn.classList.add(this.getNextCodeElement(), "selColumn", "synColumns", "inputField", "sqlIdentifier", "root");
    spanColumn.setAttribute("data-sql-element", "SELECT_SELECT");
    return spanColumn;
  }

  createLeerzeichen() {
    const spanLeerzeichen = document.createElement("span");
    spanLeerzeichen.innerHTML = " ";
    spanLeerzeichen.classList.add(this.getNextCodeElement(), "leerzeichen");
    spanLeerzeichen.setAttribute("data-goto-element", "parent");

    return spanLeerzeichen;
  }

  getNextCodeElement() {
    const codeElementWithNumber = "codeElement_" + this.htmlElementCount;
    this.htmlElementCount++;
    return codeElementWithNumber;
  }
}