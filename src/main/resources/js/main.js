const storedModel = JSON.parse(window.localStorage.getItem("fakModel"));

const initModel = {
    command: "+",
    table: {
        head: [ ],
        rows: [ [] ]
    }
}

const Model = storedModel && storedModel.table ? storedModel : initModel;

const toggleCommand = (model) =>
    model.command = doCommand(
        model.command,
        () => '-',
        () => '0',
        () => '+'
    )

const applyCommandOnCell = (command, row, valueIdx) =>
    row[valueIdx] = doCommand(
        command,
        () => row[valueIdx] + 1,
        () => row[valueIdx] - 1,
        () => 0
    )

const clear = (rows) => {
    rows.forEach(row => row.forEach((v, i) => row[i] = 0))
}

const reset = (model) => {
    model.command = initModel.command
    model.table = initModel.table
}

const addColumn = (title, table) => {
    table.head.push(title)
    table.rows.forEach(row => row.push(0))
}

const addRow = (rows) => {
    rows.push(
        rows[0].map(value => 0)
    )
}

const generateCsv = (table) => {
    let csv = [];
    csv.push(table.head.join(', '));
    table.rows.forEach(row =>
        csv.push(row.join(', '))
    );
    let blob = new Blob([csv.join('\n')], {type: "text/csv;charset=utf-8"});
    saveAs(blob, "values.csv");
}

const TableView = function(model) {
    return {
        view: function(vNode) {
            return m("table",
                m("thead", m("tr", m("th"), model.table.head.map((h, index) =>
                    m("th[contenteditable]",
                        {onblur: function(e){
                            model.table.head[index] = e.target.textContent
                        }},
                        m.trust(h))))),
                m("tbody", model.table.rows.map((row, rowIdx) =>
                    m("tr", m("td", (rowIdx + 1) + "."), row.map((value, valueIdx) =>
                        m("td.counter", {onclick: (vNode) => applyCommandOnCell(
                            model.command,
                            model.table.rows[rowIdx],
                            valueIdx
                        )},
                        value)
                    ))
                ))
            )
        }
    }
}

const ButtonView = function (title, onClickFn) {
    return {
        view: function(vNode) {
            return m("a", {onclick: onClickFn }, title)
        }
    }
}

const storeModel = (model) =>
    window.localStorage.setItem("fakModel", JSON.stringify(model))

function doCommand(command, fnPlus, fnMinus, fnZero) {
    if (command === '+') {
        return fnPlus.apply();
    } else if (command === '-') {
        return fnMinus.apply();
    } else if (command === '0') {
        return fnZero.apply();
    }
}

m.mount(document.body, {
    view: function(vNode) {
        return [
            m("div.menu",
                m(ButtonView(Model.command, () => toggleCommand(Model), storeModel(Model))),
                m(ButtonView("Column", () => addColumn("type", Model.table), storeModel(Model))),
                m(ButtonView("Row", () => addRow(Model.table.rows), storeModel(Model))),
                m(ButtonView("CSV", () => generateCsv(Model.table))),
                m(ButtonView("Clear", () => clear(Model.table.rows), storeModel(Model))),
                m(ButtonView("Reset", () => reset(Model), storeModel(Model)))
            ),
            m(TableView(Model))
        ]
    }
})
