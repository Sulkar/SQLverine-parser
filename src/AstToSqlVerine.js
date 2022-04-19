export class AstToSqlVerine {

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
        let currentCodeline;
        this.ast.forEach((element, index) => {

            
            let lastElement = false;
            switch (element.type) {

                case "SELECT":
                    currentCodeline = this.createCodeline();
                    this.createSelect(element, currentCodeline);
                    break;

                case "WHERE":
                    currentCodeline = this.createCodeline();
                    this.createWhere(element, currentCodeline);
                    break;

                case "ORDER BY":
                    this.createOrderBy(element, currentCodeline);
                break;

                case "GROUP BY":
                    this.createGroupBy(element, currentCodeline);
                break;

                case "LIMIT":
                    this.createLimit(element, currentCodeline);
                break;

                case "OFFSET":
                    this.createOffset(element, currentCodeline);
                break;

                case "JOIN":
                    currentCodeline = this.createCodeline();
                    this.createJoin(element, currentCodeline);
                break;

                case "OR":
                case "AND":
                    this.createAndOr(element, currentCodeline);
                    break;

                case "CREATE TABLE":
                    currentCodeline = this.createCodeline();
                    this.createCreateTable(element, currentCodeline);
                    break;

                case "INSERT INTO":
                    currentCodeline = this.createCodeline();
                    this.createInsert(element, currentCodeline);
                    break;

                case "CREATE COLUMN": //für CREATE TABLE STATEMENT
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

                case "CREATE FOREIGN KEY": //für CREATE TABLE STATEMENT
                    if (this.ast[index + 1] == undefined) { //letztes Element
                        lastElement = true;
                    }
                    currentCodeline = this.createCodeline();
                    this.createForeignKey(element, currentCodeline, lastElement);

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

    createJoin(element, currentCodeline) {

        const spanJoin = document.createElement("span");
        spanJoin.innerHTML="JOIN";
        spanJoin.classList.add(this.getNextCodeElement(), "btnJoin", "synSQL", "sqlJoin", "parent", "sqlIdentifier", "inputFields");
        spanJoin.setAttribute("data-sql-element", "JOIN");
        spanJoin.append(this.createLeerzeichen());

        const spanTable = this.createTable(element.table, 0, "JOIN_1");
        spanJoin.append(spanTable);
        spanJoin.append(this.createLeerzeichen());

        const spanOn = document.createElement("span");
        spanOn.innerHTML="ON";
        spanOn.classList.add(this.getNextCodeElement());
        spanOn.setAttribute("data-goto-element", this.htmlElementCount -5);
        spanJoin.append(spanOn);
        spanJoin.append(this.createLeerzeichen());
       
        const condition = this.createCondition(element.conditions[0], element.type);
        spanJoin.innerHTML += condition;

        /*
        const spanCol1=this.createColumn(element.selectField1,0,"JOIN_2");
        spanCol1.setAttribute("data-next-element", this.htmlElementCount +1);
        spanJoin.append(spanCol1);
        spanJoin.append(this.createLeerzeichen());

        const spanOperator = document.createElement("span");
        spanOperator.classList.add(this.getNextCodeElement(), "selOperators", "synOperators", "inputField", "sqlIdentifier", "root");
        spanOperator.setAttribute("data-sql-element", "JOIN_3");
        spanOperator.innerHTML = element.operator;
        spanOperator.setAttribute("data-next-element", this.htmlElementCount -5);
        spanJoin.append(spanOperator);
        spanJoin.append(this.createLeerzeichen());

        const spanCol2=this.createColumn(element.selectField2,0,"JOIN_4");
        spanCol2.setAttribute("data-next-element", this.htmlElementCount -5);
        spanJoin.append(spanCol2);
        */

        currentCodeline.append(spanJoin);
    }

    createWhere(element, currentCodeline) {
        const spanWhere = document.createElement("span");
        spanWhere.innerHTML = "WHERE";
        spanWhere.classList.add(this.getNextCodeElement(), "btnWhere", "synSQL", "sqlWhere", "parent", "sqlIdentifier", "inputFields");
        spanWhere.setAttribute("data-sql-element", "WHERE");
        spanWhere.append(this.createLeerzeichen());
        if (element.leftBracket == true) {
            spanWhere.append(this.createKlammer("("));
        }

        const condition = this.createCondition(element.conditions[0], "WHERE");
        spanWhere.innerHTML += condition;

        if (element.rightBracket == true) {
            spanWhere.append(this.createKlammer(")"));
        }

        currentCodeline.append(spanWhere);
    }

    createAndOr(element, currentCodeline){
        const spanWhere = document.createElement("span");
        spanWhere.innerHTML =" "+ element.type;
        spanWhere.classList.add(this.getNextCodeElement(), "btn"+element.type, "synSQL", "sqlWhere", "parent", "sqlIdentifier", "inputFields");
        spanWhere.setAttribute("data-sql-element", "WHERE");
        spanWhere.append(this.createLeerzeichen());
        if (element.leftBracket == true) {
            spanWhere.append(this.createKlammer("("));
        }

        const condition = this.createCondition(element.conditions[0], element.type);
        spanWhere.innerHTML += condition;

        if (element.rightBracket == true) {
            spanWhere.append(this.createKlammer(")"));
        }

        currentCodeline.append(spanWhere);
    }


    createOrderBy(element, currentCodeline){
        const spanOrderBy = document.createElement("span");
        spanOrderBy.classList.add(this.getNextCodeElement(), "btnOrder", "synSQL", "sqlOrder", "parent", "sqlIdentifier", "inputFields");
        spanOrderBy.setAttribute("data-sql-element", "ORDER");

        spanOrderBy.append(this.createLeerzeichen());
        spanOrderBy.append("ORDER BY");
        spanOrderBy.append(this.createLeerzeichen());

        element.selectFields.forEach((field,index) => {
            
            if (field.selectField.type == "AGGREGATE") {
                const spanAgg = this.createAggregate(field.selectField,0);
                spanOrderBy.append(spanAgg);
            }else {
                const spanCol = this.createColumn(field.selectField,0,"ORDER_1");
                spanOrderBy.append(spanCol);
            }

            const spanDirection = document.createElement("span");
            spanDirection.classList.add(this.getNextCodeElement(),  "synSQL", "sqlSelect", "parent", "sqlIdentifier", "inputField", "extended");
            spanDirection.setAttribute("data-sql-element", field.type);
            spanDirection.append(this.createLeerzeichen());
            spanDirection.innerHTML += field.type;
           

            spanOrderBy.append(spanDirection);
            if(index+1!=element.selectFields.length){
                spanOrderBy.append(this.createLeerzeichenMitKomma());
            }
        });

        currentCodeline.append(spanOrderBy);

    }
    createGroupBy(element, currentCodeline){
        const spanGroupBy = document.createElement("span");
        spanGroupBy.classList.add(this.getNextCodeElement(), "btnGroup", "synSQL", "sqlGroup", "parent", "sqlIdentifier", "inputFields");
        spanGroupBy.setAttribute("data-sql-element", "GROUP");

        spanGroupBy.append(this.createLeerzeichen());
        spanGroupBy.append("GROUP BY");
        spanGroupBy.append(this.createLeerzeichen());
        
        element.selectFields.forEach((field,index) => {
            const spanCol = this.createColumn(field,0,"GROUP_1");
            spanGroupBy.append(spanCol);
            if(index+1!=element.selectFields.length){
                spanGroupBy.append(this.createLeerzeichenMitKomma());
            }

        });
        currentCodeline.append(spanGroupBy);
    }

    createLimit(element, currentCodeline){
        const spanLimit = document.createElement("span");
        spanLimit.classList.add(this.getNextCodeElement(), "btnLimit", "synSQL", "sqlOrder", "parent", "sqlIdentifier", "inputFields");
        spanLimit.setAttribute("data-sql-element", "LIMIT");

        spanLimit.append(this.createLeerzeichen());
        spanLimit.append("LIMIT");
        spanLimit.append(this.createLeerzeichen());

        const spanVal = this.createInputField(0);
        spanVal.append(element.selectField.value);
        spanVal.classList.add("synValues");
        spanVal.setAttribute("data-sql-element", "LIMIT_1");
        spanLimit.append(spanVal);

        currentCodeline.append(spanLimit);
    }

    createOffset(element, currentCodeline){
        const spanOffset = document.createElement("span");
        spanOffset.classList.add(this.getNextCodeElement(), "btnOffset", "synSQL", "sqlOrder", "parent", "sqlIdentifier", "inputFields");
        spanOffset.setAttribute("data-sql-element", "OFFSET");

        spanOffset.append(this.createLeerzeichen());
        spanOffset.append("OFFSET");
        spanOffset.append(this.createLeerzeichen());

        const spanVal = this.createInputField(0);
        spanVal.append(element.selectField.value);
        spanVal.classList.add("synValues");
        spanVal.setAttribute("data-sql-element", "OFFSET_1");
        spanOffset.append(spanVal);

        currentCodeline.append(spanOffset);
    }

    createCondition(condition, parentType) {
        const spanConditionHolder = document.createElement("span");
        let conditionCount = 1;
        if (parentType == "JOIN") {
            conditionCount++;
        }
        const spanLeft = this.createColumn(condition.left, 0, parentType + "_" + conditionCount);
        spanLeft.setAttribute("data-next-element", this.htmlElementCount + 1);

        spanConditionHolder.append(spanLeft);
        spanConditionHolder.append(this.createLeerzeichen());


        const spanOperator = document.createElement("span");
        spanOperator.classList.add(this.getNextCodeElement(), "selOperators", "synOperators", "sqlWhere", "inputField", "sqlIdentifier", "root");
        conditionCount++;
        spanOperator.setAttribute("data-sql-element", parentType + "_" + conditionCount);
        spanOperator.innerHTML = condition.op;
        spanOperator.setAttribute("data-next-element", this.htmlElementCount + 1);

        spanConditionHolder.append(spanOperator);
        spanConditionHolder.append(this.createLeerzeichen());

        if (condition.right!=undefined) {
            if (Array.isArray(condition.right)) {
                // IN
                const spanLeftBracket = document.createElement("span");
                spanLeftBracket.classList.add(this.getNextCodeElement(), "btnLeftBracket", "synBrackets", "sqlIdentifier", "extended");
                spanLeftBracket.setAttribute("data-sql-element", "EXP_IN_BRACKET");
                spanLeftBracket.innerHTML="(";

                spanConditionHolder.append(spanLeftBracket);

                const inCount = condition.right.length;
                spanConditionHolder.append(this.createLeerzeichen());
                condition.right.forEach((inputField, index) => {

                    const spanInVal=document.createElement("span");
                    spanInVal.classList.add(this.getNextCodeElement(), "inputField",  "sqlIdentifier", "input", "inputValue", "synValues");
                    if(index==0){
                        spanInVal.classList.add("root");
                        spanInVal.setAttribute("data-next-element", this.htmlElementCount-3);

                    }else{
                        spanInVal.classList.add("extended", "comma");
                    }

                    spanInVal.setAttribute("data-sql-element", "EXP_IN");

                    spanInVal.innerHTML="'"+ inputField.value +"'";

                    if(index<=inCount && index>0){
                        spanConditionHolder.append(this.createLeerzeichenMitKomma());
                    }

                    spanConditionHolder.append(spanInVal);
                });

                const spanRightBracket = document.createElement("span");
                spanRightBracket.classList.add(this.getNextCodeElement(), "btnRightBracket", "synBrackets", "sqlIdentifier", "extended");
                spanRightBracket.setAttribute("data-sql-element", "EXP_IN_BRACKET");
                spanRightBracket.innerHTML=" )";

                spanConditionHolder.append(spanRightBracket);

            }else{
                // Boolsche Operatoren

                if(condition.right.type=="INPUT"){
                const spanRight = document.createElement("span");
                conditionCount++;
                spanRight.setAttribute("data-sql-element", parentType + "_" + conditionCount);
                spanRight.classList.add(this.getNextCodeElement(), "inputField", "sqlIdentifier", "root", "input", "inputValue", "synValues");
                spanRight.innerHTML="'"+condition.right.value+"'";

                spanConditionHolder.append(spanRight);
                }else{
                    conditionCount++;
                    const spanRight = this.createColumn(condition.right, 0, parentType + "_" + conditionCount);
                    spanConditionHolder.append(spanRight);
                }

            }
        }else{
            // BETWEEN
            const spanRightFrom = document.createElement("span");
            conditionCount++;
            spanRightFrom.setAttribute("data-sql-element", "EXP_BETWEEN");
            spanRightFrom.classList.add(this.getNextCodeElement(), "inputField", "sqlIdentifier", "root", "input", "inputValue", "synValues");
            spanRightFrom.innerHTML="'"+condition.rightFrom.value+"'";

            spanConditionHolder.append(spanRightFrom);


            const spanAnd = document.createElement("span");
            spanAnd.setAttribute("data-goto-element", this.htmlElementCount -7);
            spanAnd.classList.add(this.getNextCodeElement());
            spanAnd.innerHTML=" AND ";

            spanConditionHolder.append(spanAnd);

            const spanRightTo = document.createElement("span");
            conditionCount++;
            spanRightTo.setAttribute("data-sql-element", "EXP_BETWEEN");
            spanRightTo.classList.add(this.getNextCodeElement(), "inputField", "sqlIdentifier", "root", "input", "inputValue", "synValues");
            spanRightTo.innerHTML="'"+condition.rightTo.value+"'";

            spanConditionHolder.append(spanRightTo);
           


        }


        return spanConditionHolder.innerHTML;


    }

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
                    const stringFunctionSpan = this.createStringFunction(selectField, idx);
                    spanSelect.append(stringFunctionSpan);
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

        spanSelect.append(this.createLeerzeichen());

        const tableSpan = this.createTable(element.from, 0, "SELECT_FROM");
        spanSelect.append(tableSpan);

        currentCodeline.append(spanSelect);
    }

    createCreateTable(element, currentCodeline) {

        const spanCreateTable = document.createElement("span");
        spanCreateTable.innerHTML = "CREATE TABLE";
        spanCreateTable.classList.add(this.getNextCodeElement(), "synSQL", "parent", "sqlIdentifier");
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

    createInsert(element, currentCodeline) {
        const numberOfValues = element.selectFields1.length;

        const spanCreateInsert = document.createElement("span");
        spanCreateInsert.innerHTML = "INSERT INTO";
        spanCreateInsert.classList.add(this.getNextCodeElement(), "synSQL", "parent", "sqlIdentifier");
        spanCreateInsert.setAttribute("data-sql-element", "INSERT");

        spanCreateInsert.append(this.createLeerzeichen());

        //Column wird erstellt: INSERT INTO ___
        const selectField = element.selectField1;
        const tableSpan = this.createTable(selectField, 0, "INSERT_1");
        spanCreateInsert.append(tableSpan);

        //INSERT INTO ___ (___)
        spanCreateInsert.append(this.createLeerzeichen());
        spanCreateInsert.append(this.createKlammer("("));
        element.selectFields1.forEach((selectField, index) => {
            if (index > 0) {
                const leerzeichenMitKomma = this.createLeerzeichenMitKomma()
                spanCreateInsert.append(leerzeichenMitKomma);
            }
            const colSpan = this.createColumn(selectField, index, "INSERT_2");
            //element group numbers werden für das Löschen voneinander abhängigen Felder benötigt
            if (index > 0) {
                const elementGroupNumbers = this.getElementGroupNumbers(colSpan, numberOfValues, "insertColumn");
                colSpan.setAttribute("data-element-group", elementGroupNumbers);
            }
            spanCreateInsert.append(colSpan);
        });
        //...
        spanCreateInsert.append(this.createKlammer(")"));

        //INSERT INTO ___ (___) VALUES
        spanCreateInsert.append(this.createLeerzeichen());
        const spanValues = document.createElement("span");
        spanValues.innerHTML = "VALUES";
        spanValues.setAttribute("data-goto-element", "parent");
        spanValues.classList.add(this.getNextCodeElement());
        spanCreateInsert.append(spanValues);

        //INSERT INTO ___ (___) VALUES (___)
        spanCreateInsert.append(this.createLeerzeichen());
        spanCreateInsert.append(this.createKlammer("("));
        element.selectFields2.forEach((selectField, index) => {
            if (index > 0) {
                const leerzeichenMitKomma = this.createLeerzeichenMitKomma()
                spanCreateInsert.append(leerzeichenMitKomma);
            }
            const valSpan = this.createValue(selectField, index, "INSERT_3"); //erste column 0 = root
            //element group numbers werden für das Löschen voneinander abhängigen Felder benötigt
            if (index > 0) {
                const elementGroupNumbers = this.getElementGroupNumbers(valSpan, numberOfValues, "insertValue");
                valSpan.setAttribute("data-element-group", elementGroupNumbers);
            }
            spanCreateInsert.append(valSpan);
        });

        //...
        spanCreateInsert.append(this.createKlammer(")"));
        currentCodeline.append(spanCreateInsert);
    }

    getElementGroupNumbers(currentElement, numberOfValues, type) {
        let kommaNumber;
        let selectFieldNumber;
        if (type == "insertColumn") {
            //Erstellt die passenden Nummern der VALUES (___, ___, ...) Kommas und InputFields
            kommaNumber = 3 + numberOfValues * 2;
            selectFieldNumber = 4 + numberOfValues * 2;
        } else if (type == "insertValue") {
            //Erstellt die passenden Nummern des INSERT INTO (___, ___, ...) Kommas und InputFields
            kommaNumber = (4 + numberOfValues * 2) * -1;
            selectFieldNumber = (5 + numberOfValues * 2) * -1;
        }
        const colSpanElementNumber = this.getCodeElementNumber(currentElement);
        const colSpanKommaBefore = colSpanElementNumber - 1;
        const colSpanCorrespondingValueKomma = parseInt(colSpanElementNumber) + kommaNumber;
        const colSpanCorrespondingValueInputField = parseInt(colSpanElementNumber) + selectFieldNumber;
        const elementGroupNumbers = [colSpanKommaBefore, colSpanCorrespondingValueKomma, colSpanCorrespondingValueInputField];
        return elementGroupNumbers;
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

    createForeignKey(element, currentCodeline, lastElement) {

        const spanForeignKey = document.createElement("span");
        spanForeignKey.append(this.createLeerzeichen());
        spanForeignKey.append(this.createLeerzeichen());
        spanForeignKey.append(this.createLeerzeichen());
        spanForeignKey.classList.add(this.getNextCodeElement(), "synSQL", "parent", "sqlIdentifier");
        spanForeignKey.setAttribute("data-sql-element", "CREATE_FOREIGN_KEY");
        spanForeignKey.append("FOREIGN KEY");

        spanForeignKey.append(this.createLeerzeichen());
        spanForeignKey.append(this.createKlammer("("));

        //Inputfeld 1 wird erstellt
        const selectField1 = element.selectField1;
        const colSpan1 = this.createColumn(selectField1, 0, "CREATE_FOREIGN_KEY_1");
        spanForeignKey.append(colSpan1);
        spanForeignKey.append(this.createKlammer(")"));
        spanForeignKey.append(this.createLeerzeichen());
        const spanReferences = document.createElement("span");
        spanReferences.innerHTML = "REFERENCES";
        spanReferences.setAttribute("data-goto-element", "parent");
        spanReferences.classList.add(this.getNextCodeElement());
        spanForeignKey.append(spanReferences);
        spanForeignKey.append(this.createLeerzeichen());

        //Inputfeld 2 wird erstellt
        const selectField2 = element.selectField2;
        const colSpan2 = this.createTable(selectField2, 0, "CREATE_FOREIGN_KEY_2");
        spanForeignKey.append(colSpan2);
        spanForeignKey.append(this.createKlammer("("));

        //Inputfeld 3 wird erstellt
        const selectField3 = element.selectField3;
        const colSpan3 = this.createColumn(selectField3, 0, "CREATE_FOREIGN_KEY_3");
        spanForeignKey.append(colSpan3);
        spanForeignKey.append(this.createKlammer(")"));


        //Kommt danach noch eine Zeile?
        if (!lastElement) {
            spanForeignKey.append(this.createKomma());
        }
        currentCodeline.append(spanForeignKey);
    }

    getTableFromColumn(selectField) {
        if (selectField.value != undefined && selectField.value.split('.').length > 1) {
            return selectField.value.split('.')[0];
        } else if (selectField.ownTable != undefined) {
            return selectField.ownTable;
        }
        return this.ast[0].mainTable.value;
    }

    createTable(selectField, idx, sqlDataElement) {
        const spanColumn = this.createInputField(idx);
        spanColumn.setAttribute("data-sql-element", sqlDataElement);
        spanColumn.innerHTML = selectField.value;
        spanColumn.classList.add("selTable", "synTables");
        return spanColumn;
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
        spanSelSel.classList.add(this.getNextCodeElement(), "sqlIdentifier", "inputField", );
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

    createStringFunction(selectField, idx) {
        const spanStringFunc = this.createInputField(idx);
        spanStringFunc.setAttribute("data-sql-element", "SELECT_SELECT");
        spanStringFunc.innerHTML = selectField.string_function + "(";
        spanStringFunc.classList.add("selStringFunction", "synSQL", "sqlSelect");

        const stringFunction = selectField.string_function;

        if (selectField.selectFields.length > 1) {

            selectField.selectFields.forEach((selField, index) => {
                const innerSpan = document.createElement("span");
                if (index < 1) {
                    innerSpan.setAttribute("data-sql-element", "SELECT_SELECT_" + stringFunction + "_FUNCTION_1");
                    innerSpan.innerHTML = selField.value;
                    innerSpan.classList.add(this.getNextCodeElement(), this.getTableFromColumn(selField),
                        "selColumn", "synColumns", "sqlIdentifier", "inputField", "root");
                    spanStringFunc.append(innerSpan);
                } else {
                    innerSpan.setAttribute("data-sql-element", "SELECT_SELECT_" + stringFunction + "_FUNCTION_2");

                    innerSpan.classList.add(this.getNextCodeElement(),
                        "synValue", "sqlIdentifier", "inputValue", "inputField", "root");

                    if (index == 1) {
                        innerSpan.classList.add("root");
                    } else {
                        innerSpan.classList.add("extended", "comma");
                    }

                    innerSpan.innerHTML = selField.value;
                    spanStringFunc.append(this.createLeerzeichenMitKomma());
                    spanStringFunc.append(innerSpan);
                }
            });


        } else if (selectField.selectFields.length == 1) {
            const innerSpan = document.createElement("span");
            innerSpan.setAttribute("data-sql-element", "SELECT_SELECT_" + stringFunction + "_FUNCTION");
            innerSpan.innerHTML = selectField.selectFields[0].value;
            innerSpan.classList.add(this.getNextCodeElement(), this.getTableFromColumn(selectField.selectFields[0]), "selColumn", "synColumns", "sqlIdentifier", "inputField", "root");
            spanStringFunc.append(innerSpan);
        }
        spanStringFunc.innerHTML += ")";
        return spanStringFunc;
    }

    createAS(selectField, idx) {

        let spanColumn;

        if (selectField.selectField1.type == "COLUMN") {
            spanColumn = this.createColumn(selectField.selectField1, idx, "SELECT_SELECT");
        }
        if (selectField.selectField1.type == "AGGREGATE") {
            spanColumn = this.createAggregate(selectField.selectField1, idx);
        }
        if (selectField.selectField1.type == "STRING_FUNCTION") {
            /*
                        let selField;
                        selectField.selectField1.selectFields.forEach((field) => {
            
                            if (field.type == "COLUMN") {
                                selField = field;
                            }
                        });
                        spanColumn = this.createColumn(selField, idx, "SELECT_SELECT");
                        */
            spanColumn = this.createStringFunction(selectField.selectField1, idx);
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
        spanKlammer.classList.add(this.getNextCodeElement(), "sqlIdentifier", "synBrackets", "extended");
        //spanKlammer.setAttribute("data-goto-element", "parent");
        spanKlammer.innerHTML = klammerAlsString;
        if (klammerAlsString.includes("(")) {
            spanKlammer.setAttribute("data-sql-element", "LEFTBRACKET");
        } else {
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

    //function: gibt die Element Nummer aus dem Classname zurück. Z.B.: codeElement_4 -> 4
    getCodeElementNumber(codeElement) {
        let elementNumber;
        codeElement.classList.forEach(classname => {
            if (classname.includes("codeElement_")) {
                elementNumber = classname.split("_")[1];
            };
        });
        return elementNumber;
    }

}