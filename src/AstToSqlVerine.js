
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
        this.ast.forEach((element, index) => {

            let currentCodeline;
            let lastElement = false;
            switch (element.type) {

                case "SELECT":
                    currentCodeline = this.createCodeline();
                    this.createSelect(element, currentCodeline);
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
        }else if(selectField.ownTable != undefined){
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
        spanKlammer.classList.add(this.getNextCodeElement(), "sqlIdentifier", "synBrackets");
        spanKlammer.setAttribute("data-goto-element", "parent");
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