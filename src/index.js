const parser = require("./sql.pegjs");
//const parser = require("./sqlite.pegjs");
const astToSQL = require('./astToSql');

var outputAST = parser.parse("SELECT * FROM teacher");
console.log(outputAST);

//var outputSQL = astToSQL(outputAST);
//console.log(outputSQL);

//tests
document.querySelector('#sqlToParse').value = "SELECT MAX(id), * FROM schueler WHERE id IN (2,4,5)";

//parse Textarea nach DIV
document.querySelector('#btnParse').addEventListener("click", function () {
    let zuParsendenString = document.querySelector('#sqlToParse').value;   
    let outputAST = parser.parse(zuParsendenString);
    console.log(outputAST);
});