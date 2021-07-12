const parser= require("./sql.pegjs");
const astToSQL = require('./astToSql');

var outputAST = parser.parse("SELECT * FROM teacher");
console.log(outputAST);

var outputSQL = astToSQL(outputAST);
console.log(outputSQL);
