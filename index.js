class GraveData {
    static fromClearData(secondName, firstName, patronymic, birthDate, deathDate, graveDate, sectionNumber, rowNumber, graveNumber) {
        let graveData = new GraveData(null, null, null, null, null, null);

        graveData.firstName = firstName;
        graveData.secondName = secondName;
        graveData.patronymic = patronymic;
        graveData.birthDate = birthDate;
        graveData.deathDate = deathDate;
        graveData.graveDate = graveDate;
        graveData.sectionNumber = sectionNumber;
        graveData.rowNumber = rowNumber;
        graveData.graveNumber = graveNumber;

        return graveData;
    }

    constructor(fullName, graveDate, birthDeathDate, sectionNumber, rowNumber, graveNumber) {
        if (fullName) {
            let splitedName = fullName.split(" ");

            if (splitedName.length == 3) {
                this.firstName = splitedName[1];
                this.secondName = splitedName[0];
                this.patronymic = splitedName[2];
            } else {
                console.error(`GraveData - Full name isn't full \"${fullName}\"`);
            }
        } else {
            console.error("GraveData - Full name is null");
        }

        this.graveDate = graveDate;

        if (birthDeathDate) {
            let spliterBirthDeathDate = birthDeathDate.split("-");

            this.birthDate = spliterBirthDeathDate[0];
            this.deathDate = spliterBirthDeathDate[1];
        }

        this.sectionNumber = sectionNumber;
        this.rowNumber = rowNumber;
        this.graveNumber = graveNumber;
    }

    firstName = "";
    secondName = "";
    patronymic = "";

    birthDate = "";
    deathDate = "";
    graveDate = "";

    sectionNumber = "";
    rowNumber = "";
    graveNumber = "";
}

class GravesTable {
    constructor() {
        setTimeout(() => {
            this.table = document.getElementById("searchTable");
            this.tableNavigation = document.getElementById("tableNavigation");

            this.readDataBase();
        }, 100);


    }

    dataBase;

    table;

    tableNavigation;

    tableNavigationPagesCount = 9;

    gravesList = [];

    sortedGravesList = [];

    searchParameters = {};

    sectionLocations = {};

    showCount = 20;

    page = 1;

    updateSearchParameter(name, value) {
        this.searchParameters[name] = value;

        this.page = 1;

        this.updateSearch();
        this.updateTable();
        this.updateNavigation();
    }

    updateSearch() {
        this.sortedGravesList = this.gravesList.slice();

        for (var param in this.searchParameters) {
            this.sortedGravesList = this.sortedGravesList.filter((el) => {
                return (this.searchParameters[param] == "") ? true : (el[param] ? (isNaN(el[param]) ? el[param].toLowerCase().startsWith(this.searchParameters[param].toLowerCase().replace()) : (el[param] == this.searchParameters[param])) : false);
            });
        }

    }

    removePerson(element) {
        let listDuplicate = this.gravesList.slice();

        for (let i = 0; i < 9; i++) {
            listDuplicate = listDuplicate.filter((el) => { return element.children[i].textContent ? (el[["secondName", "firstName", "patronymic", "birthDate", "deathDate", "graveDate", "sectionNumber", "rowNumber", "graveNumber"][i]] == element.children[i].textContent) : (true) })
        }

        this.gravesList.splice(this.gravesList.indexOf(listDuplicate[0]), 1);

        this.updateSearch();
        this.updateTable();
        this.updateNavigation();
    }

    addPerson() {
        let el = document.getElementById("search").children;
        console.log(el[0].children[0].children[1].value);
        this.gravesList.push(GraveData.fromClearData(
            el[0].children[0].children[1].value,
            el[1].children[0].children[0].value,
            el[2].children[0].children[0].value,
            el[3].children[0].children[0].value,
            el[4].children[0].children[0].value,
            el[5].children[0].children[0].value,
            el[6].children[0].children[0].value,
            el[7].children[0].children[0].value,
            el[8].children[0].children[0].value
        ));

        this.sortGravesList();

        this.updateSearch();
        this.updateTable();
        this.updateNavigation();
    }

    getLastPage() {
        return Math.ceil(this.sortedGravesList.length / this.showCount);
    }

    isPageInRange() {

    }

    changePage(count) {
        let newPage = Math.max(1, Math.min(this.getLastPage(), this.page + count))

        this.setPage(newPage);
    }

    setPage(page) {
        if (page != this.page) {
            this.page = page;
            this.updateTable();
            this.updateNavigation();
        }
    }

    clearTable() {
        for (let i = 2; i < this.table.rows.length - 1;) {
            this.table.deleteRow(i);
        }
    }

    drawTable(list) {

        list.forEach(el => {
            let newRow = this.table.insertRow(this.table.rows.length - 1);

            newRow.insertCell().textContent = el.secondName;
            newRow.insertCell().textContent = el.firstName;
            newRow.insertCell().textContent = el.patronymic;
            newRow.insertCell().textContent = el.birthDate;
            newRow.insertCell().textContent = el.deathDate;
            newRow.insertCell().textContent = el.graveDate;

            let sectionRow = newRow.insertCell();

            if (el.sectionNumber !== '') {
                let sectionDiv = document.createElement('div');

                sectionDiv.textContent = el.sectionNumber;
                sectionDiv.style = "display: flex;flex-direction: row;align-items: center;";

                let sectionButton = document.createElement('button');

                sectionButton.onclick = function() { graveTable.showOnMap(this.parentElement.textContent); };

                sectionButton.style = "margin-left: auto;";

                let sectionImage = document.createElement('img');

                sectionImage.src = "images/show_on_map.png";
                sectionImage.height = 20;

                sectionRow.appendChild(sectionDiv);
                sectionDiv.appendChild(sectionButton);
                sectionButton.appendChild(sectionImage);
            }
            newRow.insertCell().textContent = el.rowNumber;
            newRow.insertCell().textContent = el.graveNumber;

            let removeButton = document.createElement('button');

            removeButton.textContent = "–";
            removeButton.onclick = function() { graveTable.removePerson(this.parentElement.parentElement); };
            removeButton.classList = "add_remove_button";

            let removeRow = newRow.insertCell();

            removeRow.appendChild(removeButton);
        });

    }

    showOnMap(section) {
        let map = document.getElementById('map');
        map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBCMa8g07PJKIgWpgCkco7CuVi2XZv09JE&q=${this.sectionLocations[section]}&maptype=satellite`;
        map.scrollIntoView();
    }

    updateTable() {
        this.clearTable();
        console.log(this.sortedGravesList);
        this.drawTable(this.sortedGravesList.slice((this.page - 1) * this.showCount, this.page * this.showCount));
    }

    updateNavigation() {
        for (let i = 2; i < this.tableNavigation.children.length - 2;) {
            this.tableNavigation.children[i].remove();
        }

        for (let i = 1 + Math.max(0, this.page - Math.ceil(this.tableNavigationPagesCount / 2)); i <= Math.min(parseInt(this.tableNavigationPagesCount / 2) + this.page, this.getLastPage()); i++) {
            let newdiv = document.createElement('button');

            newdiv.onclick = function(ev) { graveTable.setPage(parseInt(ev.target.textContent)); };

            newdiv.textContent = i;

            if (i == this.page) {
                newdiv.classList.add("selectedPage");
            }

            tableNavigation.insertBefore(newdiv, tableNavigation.children[tableNavigation.children.length - 2]);
        }
    }

    clearTableData() {
        this.gravesList = [];
        this.sortedGravesList = [];
        this.searchParameters = {};
        this.sectionLocations = {};

        this.updateNavigation();
        this.updateTable();
    }

    async readDataBase(input) {
        this.clearTableData();

        let file = new FileReader();

        file.onload = evt => {
            this.dataBase = XLSX.read(evt.target.result, { type: 'binary' });

            console.log(this.dataBase);

            let gravesSheet = this.dataBase.Sheets[this.dataBase.SheetNames[0]];

            for (let i = 2; true; i++) {
                if (gravesSheet["A" + i] === undefined) {
                    break;
                }

                this.gravesList.push(new GraveData(
                    gravesSheet["C" + i] ? gravesSheet["C" + i]["w"] : null,
                    gravesSheet["B" + i] ? gravesSheet["B" + i]["w"] : null,
                    gravesSheet["G" + i] ? gravesSheet["G" + i]["w"] : null,
                    gravesSheet["D" + i] ? gravesSheet["D" + i]["w"] : null,
                    gravesSheet["E" + i] ? gravesSheet["E" + i]["w"] : null,
                    gravesSheet["F" + i] ? gravesSheet["F" + i]["w"] : null));
            }

            //Сортировка массива по ФИО
            this.sortGravesList();

            let locationsSheet = this.dataBase.Sheets[this.dataBase.SheetNames[1]];

            for (let i = 2; true; i++) {
                if (locationsSheet["A" + i] === undefined) {
                    break;
                }

                this.sectionLocations[locationsSheet["A" + i]["w"]] = ((locationsSheet["B" + i] != undefined) ? locationsSheet["B" + i]["w"] : "0,0") + "," + ((locationsSheet["C" + i] != undefined) ? locationsSheet["C" + i]["w"] : "0,0");
            }

            this.updateSearch();
            this.updateTable();
            this.updateNavigation();

        };

        file.readAsBinaryString(input.files[0]);
    }

    sortGravesList() {
        this.gravesList.sort((a, b) => {
            if (a.secondName < b.secondName) { return -1; }
            if (a.secondName > b.secondName) { return 1; }

            if (a.secondName == b.secondName) {
                if (a.firstName < b.firstName) { return -1; }
                if (a.firstName > b.firstName) { return 1; }

                if (a.firstName == b.firstName) {
                    if (a.patronymic < b.patronymic) { return -1; }
                    if (a.patronymic > b.patronymic) { return 1; }
                }
            }

            return 0;
        });
    }

    s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    getTableFile() {
        if (this.dataBase == undefined) {
            return;
        }

        let sheet = this.dataBase.Sheets[this.dataBase.SheetNames[0]];

        let arr = [
            [
                sheet["A1"],
                sheet["B1"],
                sheet["C1"],
                sheet["D1"],
                sheet["E1"],
                sheet["F1"],
                sheet["G1"]
            ]
        ];

        for (let i = 0; i < this.gravesList.length; i++) {
            arr.push([i + 1, this.gravesList[i].graveDate, `${this.gravesList[i].secondName} ${this.gravesList[i].firstName} ${this.gravesList[i].patronymic}`, this.gravesList[i].sectionNumber, this.gravesList[i].rowNumber, this.gravesList[i].graveNumber, `${this.gravesList[i].birthDate}-${this.gravesList[i].deathDate}`]);
        }



        console.log(this.dataBase.Sheets[this.dataBase.SheetNames[0]])


        this.dataBase.Sheets[this.dataBase.SheetNames[0]] = XLSX.utils.aoa_to_sheet(arr);

        saveAs(new Blob([this.s2ab(XLSX.write(this.dataBase, { bookType: 'xlsx', type: 'binary' }))], { type: "application/octet-stream" }), "Таблица.xlsx");
    }
}

graveTable = new GravesTable();