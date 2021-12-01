// PEG.JS https://pegjs.org/online
// Test: https://jsoneditoronline.org/
/*
Testcode:

SELECT schueler.vorname AS 'Rufname', schueler.geburtsdatum FROM schueler
JOIN klassen ON klassen.id = schueler.klasse_id
WHERE schueler.id < '55' AND schueler.vorname LIKE 'Ri%'

*/
{
  var Sql = {
    listToString: function(x, xs) {
      return [x].concat(xs).join("");
    }
  };
}

Start
  = (SelectStmt*)?  (JoinStmt*)? (WhereStmt*)? (AndOrStmt*)?


/* Statements */
AndOrStmt
  = OrStmt 
  / AndStmt
  
SelectStmt
  = _ SelectToken
    _ x:SelectField xs:SelectFieldRest*
    _ FromToken
    _ from:Identifier
     {
     
    return {    
      type: "SELECT",
      columns: [x].concat(xs),      
      from: from
      };
  }
  
  WhereStmt = 
  	_ WhereToken 
    _ x:LogicExpr  {
    return {
    type: "WHERE",
      conditions: [x]
    };
  }
  
   OrStmt = 
  	_ OrToken
    _ x:LogicExpr  {
    return {
    type: "OR",
      conditions: [x]
    };
  }
  
  AndStmt = 
  	_ AndToken
    _ x:LogicExpr  {
    return {
    type: "AND",
      conditions: [x]
    };
  }
  
  AsStmt = 
  	_ AsToken 
    _ x:SelectField  {
    return {
    type: "AS",
      newColumn: [x]
    };
  }
  
JoinStmt = 
  	_ JoinToken
    _ x1:SelectField
    _ x11: SelectFieldJoin?
    _ "ON"
    _ x2:SelectField 
    _ "="
    _ _ x3:SelectField
    {
    if(x11 != null) x1 = x1.concat(x11).replace(","," ");
    return {
    type: "JOIN",
    table: [x1], 
    column1: [x2],
    column2: [x3]
      };
  }
  
/* Tokens */
JoinToken
 = "JOIN"i !IdentRest
SelectToken
  = "SELECT"i !IdentRest

AsToken
  = "AS"i !IdentRest
  
SeparatorToken
  = ","

FromToken
  = "FROM"i !IdentRest

WhereToken
  = "WHERE"i !IdentRest

LikeToken
  = "LIKE"i !IdentRest

OrToken
  = "OR"i !IdentRest

AndToken
  = "AND"i !IdentRest
  
SelectField "select valid field"
  = Identifier AsStmt
  / Identifier 
  / "*" 

SelectFieldJoin
  = !Reserved Identifier
  / "*" 

SelectFieldRest
  = _ SeparatorToken _ s:SelectField {
    return s;
  }

LogicExpr
  = _ "(" _ x:LogicExpr  _ ")" _ {
    return [x];
  }
  / _ left:Expr _ op:Operator _ right:Expr _ {
    return {
      left: left,
      op: op,
      right: right
    };
  }

Operator
  = "<>"       { return "<>"; }
  / "<"        { return "<";     }
  / "="        { return "=";     }
  / LikeToken  { return "LIKE";      }




/* Identifier */

Identifier "identifier"
  = x:IdentStart xs:IdentRest* {
    return Sql.listToString(x, xs);
  }
IdentifierJoin
  = _ x:IdentStart xs:IdentRest* {
    return Sql.listToString(x, xs);
  }
IdentStart
  = [''a-z_%]i

IdentRest
  = [''a-z0-9_.%]i

/* Expressions */

Expr
  = Float
  / Integer
  / Identifier
  / String

Integer "integer"
  = n:[0-9]+ {
    return parseInt(n.join(""));
  }

Float "float"
  = left:Integer "." right:Integer {
    return parseFloat([
      left.toString(),
      right.toString()
    ].join("."));
  }

String "string"
  = "'" str:ValidStringChar* "'" {
    return str.join("");
  }

ValidStringChar
  = !"'" c:. {
    return c;
  }


/* Skip */
Reserved
 = "ON"
_
  = ( WhiteSpace / NewLine )*

NewLine "newline"
  = "\r\n"
  / "\r"
  / "\n"
  / "\u2028"
  / "\u2029"

WhiteSpace "whitespace"
  = " "
  / "\t"
  / "\v"
  / "\f"