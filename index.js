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
        this.table = document.getElementById("searchTable");
        this.tableBody = this.table.querySelector("tbody")
        this.tableNavigation = document.getElementById("tableNavigation");

        ymaps.ready(() => {
            this.map = new ymaps.Map("map", {
                center: [47.513863, 42.248116],
                zoom: 17,
                controls: ['zoomControl', 'typeSelector'],
                type: "yandex#satellite"
            }, {
                maxZoom: 20,
                minZoom: 16
            });

            let showRegionsButton = new ymaps.control.Button({
                data: {
                    content: "Показать сектора"
                },
                options: {
                    maxWidth: 1000
                }
            });

            this.map.controls.add(showRegionsButton, { float: 'left' });

            showRegionsButton.select = () => {
                if (showRegionsButton.data.get("content") == "Показать сектора") {
                    this.showSectionsRegions();
                    showRegionsButton.data.set("content", "Скрыть сектора")
                } else {
                    this.hideSectionsRegions();
                    showRegionsButton.data.set("content", "Показать сектора")
                }
            }

            let removeRouteButton = new ymaps.control.Button({
                data: {
                    content: "Убрать маршрут"
                },
                options: {
                    maxWidth: 1000
                }
            });

            this.map.controls.add(removeRouteButton, { float: 'left' });

            removeRouteButton.select = () => {
                if (this.route != null) {
                    this.map.geoObjects.remove(this.route);
                }

            }
        });

        ymaps.ready(['polylabel.create']);
    }

    map;

    dataBase;

    table;

    tableNavigation;

    tableNavigationPagesCount = 9;

    gravesList = [];

    sortedGravesList = [];

    searchParameters = {};

    sectionsRegions = {};

    showCount = 20;

    page = 1;

    route;

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

    showRouteToSection(section) {
        if (this.route != null) {
            this.map.geoObjects.remove(this.route);
        }

        let createRoute = (startPoint) => {
            this.route = new ymaps.multiRouter.MultiRoute({
                referencePoints: [
                    startPoint,
                    this.getSectionCoords(section)
                ],
                params: {
                    routingMode: 'pedestrian'
                }
            });

            this.map.geoObjects.add(this.route);
        }

        navigator.geolocation.getCurrentPosition((posisiton) => {
            createRoute([posisiton.coords.latitude, posisiton.coords.longitude]);
        }, (error) => {
            createRoute([47.511522, 42.244324])
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    }

    addPerson() {
        let el = document.getElementById("search").children;

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

    showSectionsRegions() {
        var objectManager = new ymaps.ObjectManager();

        for (let a in this.sectionsRegions) {

            objectManager.add({
                type: "Feature",
                id: a,
                geometry: {
                    type: "Polygon",
                    coordinates: [this.sectionsRegions[a]],
                    fillRule: "nonZero"
                },
                properties: {
                    name: `Сектор ${a}`
                },
                options: {
                    fillColor: '#00ba47',
                    strokeColor: '#000000',
                    opacity: 0.25,
                    strokeWidth: 3,
                    strokeStyle: 'solid',
                    labelDefaults: 'light',
                    labelLayout: '{{properties.name}}',
                    labelForceVisible: 'label'
                }
            });
        }

        this.map.geoObjects.add(objectManager);
        ymaps.polylabel.create(this.map, objectManager);

        objectManager.events.add('labelclick', (ev) => {
            this.showRouteToSection(ev.get("objectId"));
        });

        console.log(objectManager);
    }

    hideSectionsRegions() {
        let toRemove = [];

        this.map.geoObjects.each((el) => {
            if (el.options !== undefined) {
                if (el.options._name !== undefined) {
                    if ((el.options._name == "objectManager") || (el.options._name == "geoObject")) {
                        toRemove.push(el);
                    }
                }
            }
        });

        toRemove.forEach((el) => {
            this.map.geoObjects.remove(el);
        });
    }

    getLastPage() {
        return Math.ceil(this.sortedGravesList.length / this.showCount);
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

        let template = document.querySelector("#person")

        list.forEach(el => {
            let clone = template.content.cloneNode(true);

            var cells = clone.querySelectorAll("td");

            cells[0].textContent = el.secondName;
            cells[1].textContent = el.firstName;
            cells[2].textContent = el.patronymic;
            cells[3].textContent = el.birthDate;
            cells[4].textContent = el.deathDate;
            cells[5].textContent = el.graveDate;
            cells[6].querySelector("div").childNodes[0].textContent = el.sectionNumber;
            cells[7].textContent = el.rowNumber;
            cells[8].textContent = el.graveNumber;

            this.table.insertRow(this.table.rows.length - 1).appendChild(clone);
        });
    }

    getSectionCoords(section) {
        let coords = [0, 0];

        this.sectionsRegions[section].forEach(el => {
            coords[0] += el[0];
            coords[1] += el[1];
        });

        coords[0] /= this.sectionsRegions[section].length;
        coords[1] /= this.sectionsRegions[section].length;

        return coords;
    }

    showOnMap(section) {
        this.map.setCenter(this.getSectionCoords(section));
        document.querySelector(".map").scrollIntoView();
    }

    updateTable() {
        this.clearTable();
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

            this.sortGravesList();

            let sectionsSheet = this.dataBase.Sheets[this.dataBase.SheetNames[1]];

            for (let i = 2; true; i++) {
                if (sectionsSheet["A" + i] === undefined) {
                    break;
                }

                if (sectionsSheet["B" + i] != undefined) {
                    let coords = [];

                    let coordsText = sectionsSheet["B" + i]["w"].split(", ");

                    for (let a = 0; a < coordsText.length; a += 2) {
                        coords.push([parseFloat(coordsText[a]), parseFloat(coordsText[a + 1])]);
                    }

                    this.sectionsRegions[sectionsSheet["A" + i]["w"]] = coords;
                }
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

            if (a.firstName < b.firstName) { return -1; }
            if (a.firstName > b.firstName) { return 1; }

            if (a.patronymic < b.patronymic) { return -1; }
            if (a.patronymic > b.patronymic) { return 1; }

            return 0;
        });
    }

    getTableFile() {
        if (this.dataBase == undefined) {
            return;
        }

        let sheet = this.dataBase.Sheets[this.dataBase.SheetNames[0]];

        let arr = [`` [
            sheet["A1"],
            sheet["B1"],
            sheet["C1"],
            sheet["D1"],
            sheet["E1"],
            sheet["F1"],
            sheet["G1"]
        ]];

        for (let i = 0; i < this.gravesList.length; i++) {
            arr.push([i + 1, this.gravesList[i].graveDate, `${this.gravesList[i].secondName} ${this.gravesList[i].firstName} ${this.gravesList[i].patronymic}`, this.gravesList[i].sectionNumber, this.gravesList[i].rowNumber, this.gravesList[i].graveNumber, `${this.gravesList[i].birthDate}-${this.gravesList[i].deathDate}`]);
        }

        this.dataBase.Sheets[this.dataBase.SheetNames[0]] = XLSX.utils.aoa_to_sheet(arr);

        let xlsx = XLSX.write(this.dataBase, { bookType: 'xlsx', type: 'binary' });
        let buffer = new ArrayBuffer(xlsx.length);
        let view = new Uint8Array(buffer);

        for (var i = 0; i < xlsx.length; i++) {
            view[i] = xlsx.charCodeAt(i) & 0xFF;
        }

        saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Таблица.xlsx");
    }
}

graveTable = new GravesTable();

/*function getPolygon() {
    let a = graveTable.map.geoObjects.getIterator();
    let b = "";

    a.getNext();
    a.getNext();
    a = a.getNext().geometry._coordPath._coordinates[0];

    console.log(a);

    for (let i = 0; i < a.length - 1; i++) {
        b += `${a[i][0]}, ${a[i][1]}`

        if (i < a.length - 2) {
            b += ", ";
        }
    }

    console.log(b);
}*/