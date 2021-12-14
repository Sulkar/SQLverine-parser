import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/SqlVerineParser.css"
import initSqlJs from "sql.js";
import {
  VerineDatabase
} from "../../SQLverine/src/VerineDatabase";

import {
  SqlVerineEditor
} from "../../SQLverine/src/SqlVerineEditor"

import {
  AstToSqlVerine
} from "./AstToSqlVerine"

import {
  parse
} from "./sqlverine.pegjs";


//global variables
var CURRENT_VERINE_DATABASE;
var DATABASE_ARRAY = [];

var CURRENT_DATABASE_INDEX = 0;
DATABASE_ARRAY.push(new VerineDatabase("Grundschule.db", null, "server"));

//SQLverine Editor
var sqlVerineEditor = new SqlVerineEditor();
sqlVerineEditor.setEditorContainer("SqlVerineEditor");
sqlVerineEditor.setSchemaContainer("schemaArea");
sqlVerineEditor.setOutputContainer("outputArea");
sqlVerineEditor.setOutputContainerMobile("outputAreaMobile");
sqlVerineEditor.showCodeButton(false);
sqlVerineEditor.showCodeSwitch(false);
sqlVerineEditor.showRunButton(false);
sqlVerineEditor.init();

loadDbFromServer("Grundschule.db");


//function: lädt eine DB vom Server
function loadDbFromServer(dbName) {
  init(fetch("data/" + dbName).then(res => res.arrayBuffer())).then(function (initObject) {

    CURRENT_VERINE_DATABASE = new VerineDatabase(dbName, initObject[0], "server");
    CURRENT_VERINE_DATABASE.setupExercises();
    CURRENT_DATABASE_INDEX = getIndexOfDatabaseobject(CURRENT_VERINE_DATABASE.name);
    DATABASE_ARRAY[CURRENT_DATABASE_INDEX] = CURRENT_VERINE_DATABASE;

    //reinit SqlVerineEditor       
    sqlVerineEditor.clearOutputContainer();
    sqlVerineEditor.resetRunFunctions();
    sqlVerineEditor.activateExercises(false);
    sqlVerineEditor.setVerineDatabase(CURRENT_VERINE_DATABASE);
    sqlVerineEditor.reinit();
    ////////////

  }, function (error) {
    console.log(error)
  });
}

// function: liefert den Index eines Datenbankobjekts aus dem DATABASE_ARRAY anhand des Namens zurück
function getIndexOfDatabaseobject(databaseName) {
  var indexOfDatabaseobject = null;
  DATABASE_ARRAY.forEach((element, index) => {
    if (element.name == databaseName) {
      indexOfDatabaseobject = index;
    }
  });
  return indexOfDatabaseobject;
}

//function: Datenbank und JSON für active code view werden geladen
async function init(dataPromise) {
  //fetch Database
  const sqlPromise = initSqlJs({
    locateFile: file => `${file}`
  });
  //fetch active code view json
  const activeCodeViewPromise = fetch("data/activeCodeViewData.json");
  const [sql, bufferedDatabase, activeCodeView] = await Promise.all([sqlPromise, dataPromise, activeCodeViewPromise]);

  const jsonData = await activeCodeView.json();

  return [new sql.Database(new Uint8Array(bufferedDatabase)), jsonData];
}


//load JSON SQL Queries
let jsonData;
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
    sqlVerineEditor.fillCodeAreaWithCode(astToSql.getOutput(), astToSql.getElementCount());

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



