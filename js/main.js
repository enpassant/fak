const Model = {
    command: "+",
    table: {
        head: [ ],
        rows: [ [] ]
    }
}

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
    let blob = new Blob([csv.join('\n')], {type: "application/csv;charset=utf-8"});
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
            return m("button", {onclick: onClickFn}, title)
        }
    }
}

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
            m(ButtonView(Model.command, () => toggleCommand(Model))),
            m(ButtonView("addColumn", () => addColumn("type", Model.table))),
            m(ButtonView("addRow", () => addRow(Model.table.rows))),
            m(ButtonView("generateCsv", () => generateCsv(Model.table))),
            m(TableView(Model))
        ]
    }
})
