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




class AstToSqlVerine {
  constructor(ast) {
    this.ast = ast;
    this.htmlElementCount = 0;
    this.outputContainer = document.createElement("div");
  }

  getOutput() {
    return this.outputContainer.innerHTML;
  }
  getElementCount() {
    return this.htmlElementCount;
  }

  parseAst() {
    /* */
    this.ast.forEach((element, index) => {

      let currentCodeline;
      switch (element.type) {

        case "SELECT":
          currentCodeline = this.createCodeline();
          this.createSelect(element, currentCodeline);
          break;

        case "CREATE TABLE":
          currentCodeline = this.createCodeline();
          this.createCreateTable(element, currentCodeline);
          break;

        case "CREATE COLUMN":
          let lastElement = false;
          if (this.ast[index + 1] == undefined) { //letztes Element
            lastElement = true;
          }
          currentCodeline = this.createCodeline();
          this.createCreateColumn(element, currentCodeline, lastElement);

          if (lastElement) {
            const lastCreateBracket = this.createCodeline();
            const klammerRechts = this.createKlammer(")");
            klammerRechts.removeAttribute("data-goto-element");
            lastCreateBracket.append(klammerRechts);
          }
          break;



        default:
          console.log("Element of type " + element.type + " canot be parsed.");

      };
    });

    console.log(this.outputContainer.innerHTML);
  };

  createSelect(element, currentCodeline) {

    const spanSelect = document.createElement("span");
    spanSelect.innerHTML = "SELECT";
    spanSelect.classList.add(this.getNextCodeElement(), "btnSelect", "synSQL", "sqlSelect", "start", "parent", "sqlIdentifier");
    spanSelect.setAttribute("data-sql-element", "SELECT");

    element.selectFields.forEach((selectField, idx) => {

      const leerZeichenSpan = this.createLeerzeichen();
      console.log(idx)
      if (idx > 0) {
        leerZeichenSpan.innerHTML = ", ";
      }
      spanSelect.append(leerZeichenSpan);
      switch (selectField.type) {

        case "COLUMN":

          const colSpan = this.createColumn(selectField, idx, "SELECT_SELECT");
          spanSelect.append(colSpan);
          break;
        case "AS":
          const asSpan = this.createAS(selectField, idx);
          spanSelect.append(asSpan);
          break;
        case "AGGREGATE":
          const aggregateSpan = this.createAggregate(selectField, idx);
          spanSelect.append(aggregateSpan);
          break;
        case "STRING_FUNCTION":

          break;

        default:
          console.log("Selectfield of type " + selectField.type + " canot be parsed.");

      };

    });

    spanSelect.append(this.createLeerzeichen());

    const spanFrom = document.createElement("span");
    spanFrom.innerHTML = "FROM";
    spanFrom.setAttribute("data-goto-element", "parent");
    spanFrom.classList.add(this.getNextCodeElement());
    spanSelect.append(spanFrom);
    this.createTable(element, spanSelect);


    // // mein handy hat keinen Akku mehr LOL :-D

    currentCodeline.append(spanSelect);


  }

  createCreateTable(element, currentCodeline) {

    const spanCreateTable = document.createElement("span");
    spanCreateTable.innerHTML = "CREATE TABLE";
    spanCreateTable.classList.add(this.getNextCodeElement(), "synSQL", "start", "parent", "sqlIdentifier");
    spanCreateTable.setAttribute("data-sql-element", "CREATE_TABLE");

    spanCreateTable.append(this.createLeerzeichen());

    //Inputfeld wird erstellt
    const selectField = element.selectField;
    const colSpan = this.createValue(selectField, 0, "CREATE_TABLE_1");
    spanCreateTable.append(colSpan);

    spanCreateTable.append(this.createLeerzeichen());
    spanCreateTable.append(this.createKlammer("("));

    currentCodeline.append(spanCreateTable);
  }

  createCreateColumn(element, currentCodeline, lastElement) {

    const spanCreateColumn = document.createElement("span");
    spanCreateColumn.append(this.createLeerzeichen());
    spanCreateColumn.append(this.createLeerzeichen());
    spanCreateColumn.append(this.createLeerzeichen());
    spanCreateColumn.classList.add(this.getNextCodeElement(), "synSQL", "parent", "sqlIdentifier");
    spanCreateColumn.setAttribute("data-sql-element", "CREATE_COLUMN");

    //Inputfeld wird erstellt
    const selectField = element.selectField;
    const colSpan = this.createValue(selectField, 0, "CREATE_COLUMN_1");
    spanCreateColumn.append(colSpan);
    spanCreateColumn.append(this.createLeerzeichen());

    //Typfeld wird erstellt
    const spanDatatype = this.createInputField(0);
    spanDatatype.setAttribute("data-sql-element", "CREATE_COLUMN_2");
    spanDatatype.innerHTML = element.datatype;
    spanDatatype.classList.add("synTyp", "selTyp");
    spanCreateColumn.append(spanDatatype);

    //Constraintfeld wird erstellt
    if (element.constraint != null) {
      spanCreateColumn.append(this.createLeerzeichen());
      const spanConstraint = this.createInputField(0);
      spanConstraint.setAttribute("data-sql-element", "CREATE_COLUMN_3");
      spanConstraint.innerHTML = element.constraint;
      spanConstraint.classList.add("synTyp", "selConstraint");
      spanCreateColumn.append(spanConstraint);
    }

    //Kommt danach noch eine Zeile?
    if (!lastElement) {
      spanCreateColumn.append(this.createKomma());
    }

    currentCodeline.append(spanCreateColumn);
  }

  getTableFromColumn(selectField) {
    let tableName = undefined;
    if (selectField.value != undefined && selectField.value.split('.').length > 1) {

      return selectField.value.split('.')[0];

    }
    return this.ast[0].mainTable.value;
  }

  createTable(element, htmlToAppend) {
    htmlToAppend.append(this.createLeerzeichen());

    const spanFrom = document.createElement("span");
    spanFrom.innerHTML = element.from.value;
    spanFrom.classList.add(this.getNextCodeElement(), "selTable", "synTables", "sqlIdentifier", "inputField", "root");
    spanFrom.setAttribute("data-sql-element", "SELECT_FROM");
    htmlToAppend.append(spanFrom);
  }

  createColumn(selectField, idx, sqlDataElement) {

    const spanColumn = this.createInputField(idx);
    spanColumn.setAttribute("data-sql-element", sqlDataElement);
    spanColumn.innerHTML = selectField.value;
    spanColumn.classList.add(this.getTableFromColumn(selectField), "selColumn", "synColumns");
    return spanColumn;
  }

  createValue(selectField, idx, sqlDataElement) {
    const spanValue = this.createInputField(idx);
    spanValue.setAttribute("data-sql-element", sqlDataElement);
    spanValue.innerHTML = "'" + selectField.value + "'";
    spanValue.classList.add("synValues", "inputValue");
    return spanValue;

  }


  createInputField(idx) {
    const spanSelSel = document.createElement("span");
    spanSelSel.classList.add(this.getNextCodeElement(), "sqlIdentifier", "inputField",);
    if (idx > 0) {
      spanSelSel.classList.add("extended");
    } else {
      spanSelSel.classList.add("root");
    }
    return spanSelSel;
  }

  createAggregate(selectField, idx) {
    const spanAgg = this.createInputField(idx);
    spanAgg.setAttribute("data-sql-element", "SELECT_SELECT");
    spanAgg.innerHTML = selectField.aggregate + "(";
    spanAgg.classList.add("selAggregate", "synSQL", "sqlSelect");

    const innerSpan = document.createElement("span");
    innerSpan.classList.add(this.getNextCodeElement(), this.getTableFromColumn(selectField.selectField), "selColumn", "synColumns", "sqlIdentifier", "inputField", "root");
    innerSpan.setAttribute("data-sql-element", "SELECT_SELECT_AGGREGAT");
    innerSpan.innerHTML = selectField.selectField.value;

    spanAgg.append(innerSpan);
    spanAgg.innerHTML += ")";

    return spanAgg;
  }

  createAS(selectField, idx) {

    let spanColumn;

    if (selectField.selectField1.type == "COLUMN") {
      spanColumn = this.createColumn(selectField.selectField1, idx, "SELECT_SELECT");
    }
    if (selectField.selectField1.type == "AGGREGATE") {
      spanColumn = this.createColumn(selectField.selectField1.selectField, idx, "SELECT_SELECT");
    }
    if (selectField.selectField1.type == "STRING_FUNCTION") {

      let selField;
      selectField.selectField1.selectFields.forEach((field) => {

        if (field.type == "COLUMN") {
          selField = field;
        }
      });
      spanColumn = this.createColumn(selField, idx, "SELECT_SELECT");
    }

    const innerSpan = document.createElement("span");
    innerSpan.classList.add(this.getNextCodeElement(), "btnAs", "synSQL", "sqlAs", "sqlIdentifier");
    innerSpan.setAttribute("data-sql-element", "AS");
    innerSpan.append(this.createLeerzeichen());

    innerSpan.innerHTML += "AS";

    innerSpan.append(this.createLeerzeichen());

    const asSpan = this.createValue(selectField.selectField2, idx, "AS_1");

    innerSpan.append(asSpan);
    spanColumn.append(innerSpan);
    return spanColumn;
  }

  createLeerzeichen() {
    const spanLeerzeichen = document.createElement("span");
    spanLeerzeichen.innerHTML = "&nbsp;";
    spanLeerzeichen.classList.add(this.getNextCodeElement(), "leerzeichen");
    spanLeerzeichen.setAttribute("data-goto-element", "parent");

    return spanLeerzeichen;
  }
  createKomma() {
    const spanKomma = document.createElement("span");
    spanKomma.innerHTML = ",";
    spanKomma.classList.add(this.getNextCodeElement(), "komma");
    spanKomma.setAttribute("data-goto-element", "parent");

    return spanKomma;
  }
  createLeerzeichenMitKomma() {
    const spanLeerzeichenKomma = document.createElement("span");
    spanLeerzeichenKomma.innerHTML = ",&nbsp;";
    spanLeerzeichenKomma.classList.add(this.getNextCodeElement(), "leerzeichen");
    spanLeerzeichenKomma.setAttribute("data-goto-element", "parent");

    return spanLeerzeichenKomma;
  }
  createKlammer(klammerAlsString) {
    const spanKlammer = document.createElement("span");    
    spanKlammer.classList.add(this.getNextCodeElement(), "sqlIdentifier", "synBrackets");
    spanKlammer.setAttribute("data-goto-element", "parent");
    spanKlammer.innerHTML = klammerAlsString;
    if(klammerAlsString.includes("(")){      
      spanKlammer.setAttribute("data-sql-element", "LEFTBRACKET");
    }else{
      spanKlammer.setAttribute("data-sql-element", "RIGHTBRACKET");
    }

    return spanKlammer;
  }

  createCodeline() {
    const spanCodeline = document.createElement("span");
    spanCodeline.classList.add("codeline");
    this.outputContainer.append(spanCodeline);
    return spanCodeline;
  }

  getNextCodeElement() {
    const codeElementWithNumber = "codeElement_" + this.htmlElementCount;
    this.htmlElementCount++;
    return codeElementWithNumber;
  }
}