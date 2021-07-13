//const parser = require("./sql.pegjs");
const parser = require("./mysql.pegjs");
//const parser = require("./sqlite.pegjs");

/*
import { bigQueryToSQL, unionToSQL, multipleToSQL } from './astToSql/union'
import { DEFAULT_OPT, setParserOpt } from './astToSql/util'
setParserOpt(DEFAULT_OPT);

const surportedTypes = ['select', 'delete', 'update', 'insert', 'drop', 'rename', 'truncate', 'call', 'desc', 'use', 'alter', 'set', 'create', 'lock', 'unlock', 'bigquery', 'declare', 'show']

function checkSupported(expr) {
  const ast = expr && expr.ast ? expr.ast : expr
  if (!surportedTypes.includes(ast.type)) throw new Error(`${ast.type} statements not supported at the moment`)
}

function toSQL(ast) {
  if (Array.isArray(ast)) {
    ast.forEach(checkSupported)
    return multipleToSQL(ast)
  }
  checkSupported(ast)
  const { type } = ast
  if (type === 'bigquery') return bigQueryToSQL(ast)
  return unionToSQL(ast)
}*/




const astToSQL = require('./astToSql');

//var outputAST = parser.parse("SELECT * FROM teacher");
//console.log(outputAST);
//toSQL(outputAST);


const outputDiv = document.querySelector('#sqlParserOutput');


//tests
document.querySelector('#sqlToParse').value = "SELECT name FROM schueler WHERE id = 5 AND name = 'Richi'";

//parse Textarea nach DIV
document.querySelector('#btnParse').addEventListener("click", function () {
    let zuParsendenString = document.querySelector('#sqlToParse').value;
    let outputAST = parser.parse(zuParsendenString);
    console.log(outputAST);

    var outputSQL = astToSQL(outputAST.ast);
    outputDiv.innerHTML = outputSQL;
    console.log(outputSQL);
});