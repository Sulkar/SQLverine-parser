{
	//functions:
  	function checkBrackets(bracket){
  		if(bracket == "(" || bracket == ")") return true;
        else return false;
	}
} 
  
Start = StartSelect / StartCreate / StartInsert / StartUpdate / StartDelete / StartDrop / StartAlter

StartAlter = alter:AlterStmt drop:(AlterDropStmt)? renameTable:(AlterRenameTableStmt)? renameColumn:(AlterRenameColumnStmt)? 
addColumn:(AlterAddColumnStmt)?
	{
    let resultArray = [];
    resultArray = resultArray.concat(alter);
    if(drop != null)resultArray = resultArray.concat(drop);
    if(renameTable != null)resultArray = resultArray.concat(renameTable);
    if(renameColumn != null)resultArray = resultArray.concat(renameColumn);
    if(addColumn != null)resultArray = resultArray.concat(addColumn);
    return resultArray;
    }
    
StartUpdate = update:UpdateStmt where:(WhereStmt*)? andOr:(AndOrStmt*)?
	{
    let resultArray = [];
    resultArray = resultArray.concat(update);
    where.forEach((where) =>{
      resultArray = resultArray.concat(where);
    });
    andOr.forEach((andOr) =>{
      resultArray = resultArray.concat(andOr);
    });
    return resultArray;
    }

StartDelete = del:DeleteStmt where:(WhereStmt*)? andOr:(AndOrStmt*)?
	{
    let resultArray = [];
    resultArray = resultArray.concat(del);
    where.forEach((where) =>{
      resultArray = resultArray.concat(where);
    });
    andOr.forEach((andOr) =>{
      resultArray = resultArray.concat(andOr);
    });
    return resultArray;
    }

StartDrop = drop:DropStmt
	{
    let resultArray = [];
    resultArray = resultArray.concat(drop);
    return resultArray;
    }
    
StartInsert = insert:InsertStmt
	{
    let resultArray = [];
    resultArray = resultArray.concat(insert);
    return resultArray;
    }

StartCreate = create:CreateStmt createColumn:(CreateColumnStmt*)? craeateForeignKey:(CreateForeignKeyStmt*)? _ ")"
	{
    let resultArray = [];

    resultArray = resultArray.concat(create);

    createColumn.forEach((createColumn) =>{
      resultArray = resultArray.concat(createColumn);
    });
    craeateForeignKey.forEach((craeateForeignKey) =>{
      resultArray = resultArray.concat(craeateForeignKey);
    });
    return resultArray;
    }
    
StartSelect
 = select:SelectStmt join:(JoinStmt*)? where:(WhereStmt*)? andOr:(AndOrStmt*)? groupBy:(GroupByStmt*)? having:(HavingStmt*)? andOr2:(AndOrStmt*)? orderBy:(OrderByStmt*)? limit:(LimitStmt*)? offset:(OffsetStmt*)?
 	
  { 
    let resultArray = [];
    
    resultArray = resultArray.concat(select);
    
    join.forEach((join) =>{
      resultArray = resultArray.concat(join);
    });
    where.forEach((where) =>{
      resultArray = resultArray.concat(where);
    });
    andOr.forEach((andOr) =>{
      resultArray = resultArray.concat(andOr);
    });
    orderBy.forEach((orderBy) =>{
      resultArray = resultArray.concat(orderBy);
    });
    groupBy.forEach((groupBy) =>{
      resultArray = resultArray.concat(groupBy);
    });
    having.forEach((having) =>{
      resultArray = resultArray.concat(having);
    });   
    andOr2.forEach((andOr2) =>{
      resultArray = resultArray.concat(andOr2);
    });
    limit.forEach((limit) =>{
      resultArray = resultArray.concat(limit);
    });
     offset.forEach((offset) =>{
      resultArray = resultArray.concat(offset);
    });
    return resultArray;
  }

/* Statements */
AndOrStmt
  = OrStmt 
  / AndStmt

InsertStmt
  = _ "INSERT INTO"i  	
    _ x:SelectField
    _ "("
    _ x1:SelectField x2:SelectFieldRest*
    _ ")"
    _ "VALUES"i
    _ "("
    _ x3:SelectField x4:SelectFieldRest*
    _ ")"
     {     
    return {    
      type: "INSERT INTO",
      selectField1: x,
      mainTable: x,
      selectFields1: [x1].concat(x2),
      selectFields2: [x3].concat(x4)
      };
  }
  
UpdateStmt
  = _ "UPDATE"i  	
    _ x:SelectField
    _ "SET"i
    _ x2:(LogicExpr _ ","?)*
     {
     let updates = []
     x2.forEach(element =>{
     	updates = updates.concat(element[0])
     });
     
    return {    
      type: "UPDATE",
      selectField1: x,
      mainTable: x,
      updates: updates
      };
  }

DropStmt
  = _ "DROP TABLE"i  	
    _ x:SelectField
     {     
    return {    
      type: "DROP TABLE",
      selectField: x,      
      mainTable: x
      };
  }
  
  AlterStmt
  = _ "ALTER TABLE"i  	
    _ x:SelectField
     {     
    return {    
      type: "ALTER TABLE",
      selectField: x,      
      mainTable: x
      };
  }
  
 AlterDropStmt
  = _ "DROP COLUMN"i  	
    _ x:SelectField
     {     
    return {    
      type: "ALTER DROP COLUMN",
      selectField: x,      
      };
  }

 AlterRenameTableStmt
  = _ "RENAME TO"i  	
    _ x:SelectField
     {     
    return {    
      type: "ALTER RENAME TABLE",
      selectField: x,      
      };
 }
 
 AlterRenameColumnStmt
  = _ "RENAME"i !"TO"i
    _ x:SelectField
    _ "TO"i
    _ x1:SelectField
     {     
    return {    
      type: "ALTER RENAME COLUMN",
      selectField1: x,
      selectField2: x1, 
      };
  }
 
 AlterAddColumnStmt
  = _ "ADD COLUMN"i  	
    _ x:SelectField _ x1:DatatypeTokens
     {     
    return {    
      type: "ALTER ADD COLUMN",
      selectField: x,
      datatype: x1
      };
 }
 
DeleteStmt
  = _ "DELETE FROM"i  	
    _ x:SelectField
     {     
    return {    
      type: "DELETE FROM",
      selectField: x,      
      mainTable: x
      };
  }
  
CreateStmt
  = _ "CREATE TABLE"i  	
    _ x:SelectField
    _ "("
     {     
    return {    
      type: "CREATE TABLE",
      selectField: x,      
      mainTable: x
      };
  }
CreateColumnStmt = 
  	_ x:SelectField _ x1:DatatypeTokens _ x2:ConstraintTokens?
    _ ","?
    {
    return {
    type: "CREATE COLUMN",
      selectField: x,
      datatype: x1,
      constraint: x2
    };
  }
 CreateForeignKeyStmt
  = _ "FOREIGN KEY"i
    _ "("
    _ x:SelectField
    _ ")"
    _ "REFERENCES"i
    _ x1:SelectField
    _ "("
    _ x2:SelectField
    _ ")"
    _ ","?
     {
     x2.ownTable = x1.value;
    return {    
      type: "CREATE FOREIGN KEY",
      selectField1: x,
      selectField2: x1, 
      selectField3: x2 
      };
  }

SelectStmt
  = _ "SELECT"i  	
    _ x:SelectField xs:SelectFieldRest*
    _ "FROM"i
    _ from:SelectField
     {     
    return {    
      type: "SELECT",
      selectFields: [x].concat(xs),      
      from: from,
      mainTable: from
      };
  }
  
  WhereStmt = 
  	_ "WHERE"i
    _ x1:"("?
    _ x2:(LogicExprIn / LogicExprBetween / LogicExpr)
    _ x3:")"?
    {
    x1 = checkBrackets(x1);
    x3 = checkBrackets(x3);
    return {
    type: "WHERE",
      leftBracket: x1,
      rightBracket: x3,
      conditions: [x2]
    };
  }
  
  HavingStmt = 
  	_ "HAVING"i
    _ x1:"("?
    _ x2:(LogicExprIn / LogicExprBetween / LogicExpr)
    _ x3:")"?
    {
    x1 = checkBrackets(x1);
    x3 = checkBrackets(x3);
    return {
    type: "HAVING",
      leftBracket: x1,
      rightBracket: x3,
      conditions: [x2]
    };
  }

   OrStmt = 
  	_ "OR"i
    _ x1:"("?
   	_ x2:(LogicExprIn / LogicExprBetween / LogicExpr)
    _ x3:")"?
    {
    x1 = checkBrackets(x1);
    x3 = checkBrackets(x3);
    return {
    type: "OR",
      leftBracket: x1,
      rightBracket: x3,
      conditions: [x2]
    };
  }
  
  AndStmt = 
  	_ "AND"i
    _ x1:"("?
    _ x2:(LogicExprIn / LogicExprBetween / LogicExpr)
    _ x3:")"?
    {
    x1 = checkBrackets(x1);
    x3 = checkBrackets(x3);
    return {
    type: "AND",
      leftBracket: x1,
      rightBracket: x3,
      conditions: [x2]
    };
  }
  
  AsStmt = 
    _ x1:(AggregateStmt / StringFunctionStmt / Identifier)
  	_ "AS"i ![a-z0-9]i
    _ x2:SelectField  {
    return {
    type: "AS",  
      selectField1: x1,    
      selectField2: x2
    };
  }
 
  GroupByStmt = 
  	_ "GROUP BY"i 
    _ x1:SelectField x2:SelectFieldRest*
    {
    return {
    type: "GROUP BY",      
      selectFields: [x1].concat(x2)
    };
  }
  
  OrderByStmt = 
  	_ "ORDER BY"i 
    _ x1:SelectField x2:SelectFieldRest*
    {
    return {
    type: "ORDER BY",      
      selectFields: [x1].concat(x2)
    };
  }
  
  AscStmt =
  _ x1:(AggregateStmt / StringFunctionStmt / Identifier)
  _ "ASC"i ![a-z0-9]i{
    return {
    type: "ASC",
    selectField: x1
    };
  }

  DescStmt =
  _ x1:(AggregateStmt / StringFunctionStmt / Identifier)
  _ "DESC"i ![a-z0-9]i{
    return {
    type: "DESC",
    selectField: x1
    };
  }
  
  LimitStmt = 
  	_ "LIMIT"i 
    _ x1:SelectField
    {
    return {
    type: "LIMIT",      
      selectField: x1
    };
  }

  OffsetStmt = 
  	_ "OFFSET"i 
    _ x1:SelectField
    {
    return {
    type: "OFFSET",      
      selectField: x1
    };
  }
  
  AggregateStmt = 
  	_ x1:AggregateTokens 
    _ "("
    _ x2:SelectField
    _ ")"{
    return {
    type: "AGGREGATE",
     aggregate: x1,
      selectField: x2
    };
  }
   
  StringFunctionStmt = 
  	_ x1:StringFunctionTokens 
    _ "("
    _ x2:SelectField x3:SelectFieldRest*
    _ ")"{
    return {
    type: "STRING_FUNCTION",
      string_function: x1,
      selectFields: [x2].concat(x3)
    };
  }

JoinStmt = 
  	_ "JOIN"i
    _ x1:SelectField
    _ x11: (!"ON"i SelectField)?
    _ "ON"i
    _ x2:SelectField 
    _ x21:Operator
    _ x3:SelectField
    {
    if(x11 != null) x1 = [x1].concat(x11[1]); // [0] = undefined, [1] = Identifier
    let conditions = {
    left: x2,
    op: x21,
    right: x3
    
    }
    return {   
    type: "JOIN",
    table: x1, 
    conditions: [conditions]
          };
  }

/* Select Fields */
SelectField "select valid SelectField"
  = (
  AscStmt / DescStmt / AsStmt 
  / AggregateStmt
  / StringFunctionStmt
  / Identifier
  / "*") 

SelectFieldRest = _ "," _ s:SelectField {
	return s;
}

/* Operators */
LogicExpr
  = _ left:SelectField _ op:Operator _ right:SelectField _ {
    return {
      left: left,
      op: op,
      right: right
    };
  }
  
LogicExprBetween
  = _ left:SelectField _ op:"BETWEEN"i _ rightFrom:SelectField _ "AND" _ rightTo:SelectField _ {
    return {
      left: left,
      op: op,
      rightFrom: rightFrom,
      rightTo: rightTo
    };
  }
  
LogicExprIn
  = _ left:SelectField _ op:"IN"i _ "(" _ right:SelectField rightN:SelectFieldRest* _ ")" {   
    return {
      left: left,
      op: op,
      right:[right].concat(rightN)
    };
  }

/* Identifier */
AggregateTokens = "MIN"i / "MAX"i / "AVG"i / "COUNT"i / "SUM"i
StringFunctionTokens = "LENGTH"i / "UPPER"i / "LOWER"i / "SUBSTR"i / "LTRIM"i / "RTRIM"i / "TRIM"i / "REPLACE"i / "INSTR"i
DatatypeTokens = "INTEGER"i / "TEXT"i / "REAL"i / "BLOB"i
ConstraintTokens = "UNIQUE"i / "PRIMARY KEY"i / "NOT NULL"i

Operator
  = "<>"       { return "<>"; }
  / "<="        { return "<="; }
  / ">="        { return ">="; }
  / "<"        { return "<"; }
  / ">"        { return ">"; }
  / "="        { return "="; }
  / "LIKE"i  { return "LIKE"; }

Identifier =  Input / TableColumn
IdentifierRest = _ "," _ s:Identifier {
	return s;
}

TableColumn = x:[a-zäÄüÜöÖß0-9_%*]i xs:[a-zäÄüÜöÖß0-9_.%*]i* {
    let tempType = ""    
    if(isNaN(text(x.concat(xs)))) tempType = "COLUMN"
    else tempType = "INPUT"
    return {
    type:tempType,
    value:text(x.concat(xs))
    }
}

Input "Input" 
	= [''] x:[\-a-z0-9_%*äÄüÜöÖß ]i* [''] {
    return {
    type:"INPUT",
    value:text(x).replaceAll("'","")
    }
}

/* Skip */
_ = ( WhiteSpace / NewLine )*
NewLine "newline" = "\n"
WhiteSpace "whitespace"  = " "