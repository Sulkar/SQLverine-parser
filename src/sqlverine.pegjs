
Start
 = select:(SelectStmt*)?  join:(JoinStmt*)? where:(WhereStmt*)? andOr:(AndOrStmt*)? groupBy:(GroupByStmt*)? 
 	orderBy:(OrderByStmt*)? limit:(LimitStmt*)? offset:(OffsetStmt*)?
 	
  { 
    let resultArray = [];
    select.forEach((select) =>{
      resultArray = resultArray.concat(select);
    });
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
  
SelectStmt
  = _ "SELECT"i  	
    _ x:SelectField xs:SelectFieldRest*
    _ "FROM"i
    _ from:Identifier
     {     
    return {    
      type: "SELECT",
      columns: [x].concat(xs),      
      from: from
      };
  }
  
  WhereStmt = 
  	_ "WHERE"i
    _ x1:"("?
    _ x2:(LogicExprIn / LogicExprBetween / LogicExpr)
    _ x3:")"?
    {
    return {
    type: "WHERE",
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
    return {
    type: "AND",
      leftBracket: x1,
      rightBracket: x3,
      conditions: [x2]
    };
  }
  
  AsStmt = 
  	_ "AS"i 
    _ x:SelectField  {
    return {
    type: "AS",      
      column: x
    };
  }
  
  GroupByStmt = 
  	_ "GROUP BY"i 
    _ x1:SelectField x2:SelectFieldRest*
    {
    return {
    type: "GROUP BY",      
      column: [x1].concat(x2)
    };
  }
  
  OrderByStmt = 
  	_ "ORDER BY"i 
    _ x1:SelectFieldOrderBy x2:SelectFieldOrderByRest*
    {
    return {
    type: "ORDER BY",      
      column: [x1].concat(x2)
    };
  }
  
  AscStmt =
  _ "ASC"i {
    return {
    type: "ASC"
    };
  }
  
  DescStmt =
  _ "DESC"i {
    return {
    type: "DESC"
    };
  }
  
  LimitStmt = 
  	_ "LIMIT"i 
    _ x1:SelectField
    {
    return {
    type: "LIMIT",      
      value: x1
    };
  }
  OffsetStmt = 
  	_ "OFFSET"i 
    _ x1:SelectField
    {
    return {
    type: "OFFSET",      
      value: x1
    };
  }
  
  AggregatStmt = 
  	_ x1:AggregatTokens 
    _ "("
    _ x2:SelectField
    _ ")"{
    return {
    type: "AGGREGAT",
     aggregat: x1,
      column: x2
    };
  }
  
JoinStmt = 
  	_ "JOIN"i
    _ x1:SelectField
    _ x11: (!"ON" SelectField)?
    _ "ON"i
    _ x2:SelectField 
    _ "="
    _ x3:SelectField
    {
    if(x11 != null) x1 = x1.concat(x11).replace(","," ");
    return {
    type: "JOIN",
    table: x1, 
    column1: x2,
    column2: x3
      };
  }
/* Select Fields */
SelectFieldOrderBy "select valid SelectFieldOrderBy"
  = (
  AggregatStmt AscStmt
  / AggregatStmt DescStmt
  / AggregatStmt 
  / Identifier AscStmt
  / Identifier DescStmt
  / Identifier 
  / "*") 

SelectField "select valid SelectField"
  = (
  AggregatStmt AsStmt
  / AggregatStmt 
  / Identifier AsStmt
  / Identifier 
  / "*") 

SelectFieldRest = _ "," _ s:SelectField {
	return s;
}
SelectFieldOrderByRest = _ "," _ s:SelectFieldOrderBy {
	return s;
}

/* Tokens */
AggregatTokens = "MIN"i / "MAX"i / "AVG"i / "COUNT"i / "SUM"i

LogicExpr
  = _ "(" _ x:LogicExpr  _ ")" _ {
    return [x];
  }
  / _ left:SelectField _ op:Operator _ right:SelectField _ {
    return {
      left: left,
      op: op,
      right: right
    };
  }
  
LogicExprBetween
  = _ "(" _ x:LogicExpr  _ ")" _ {
    return [x];
  }
  / _ left:SelectField _ op:"BETWEEN"i _ rightFrom:SelectField _ "AND" _ rightTo:SelectField _ {
    return {
      left: left,
      op: op,
      rightFrom: rightFrom,
      rightTo: rightTo
    };
  }
  
LogicExprIn
  = _ "(" _ x:LogicExpr  _ ")" _ {
    return [x];
  }
  / _ left:SelectField _ op:Operator _ "(" _ right:SelectField rightN:SelectFieldRest* _ ")" {   
    return {
      left: left,
      op: op,
      right:[right].concat(rightN)
    };
  }

Operator
  = "<>"       { return "<>"; }
  / "<"        { return "<"; }
  / ">"        { return ">"; }
  / "<="        { return "<="; }
  / ">="        { return ">="; }
  / "="        { return "="; }
  / "LIKE"i  { return "LIKE"; }
  / "BETWEEN"i  { return "BETWEEN"; }
  / "IN"i  { return "IN"; }

/* Identifier */
Identifier "identifier"
  = x:IdentStart xs:IdentRest* {
    return text(x.concat(xs))
  }

IdentStart = [''a-z0-9_%]i
IdentRest = [''a-z0-9_.%*]i

/* Skip */
_ = ( WhiteSpace / NewLine )*
NewLine "newline" = "\n"
WhiteSpace "whitespace"  = " "