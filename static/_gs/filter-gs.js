/**
 * Filter task by labels
 * @param {string} labelsJson 
 * @param {string} relation AND , OR
 */
function filterTaskByLabels(labelsJson, relation) {
    let labels = JSON.parse(labelsJson);
    if (labels.length === 0) {
        removeFilters();
        return;
    }
    let ss = SpreadsheetApp.getActiveSheet();
    let lastIndex = ss.getLastRow();
    let range = ss.getRange(1, 2, lastIndex);
    let filter = range.getFilter();
    if (!filter) {
        filter = range.createFilter();
    }
    let exps = labels.map((label) => {
        return `COUNTIF(B2,"*[${label}]*") > 0`
    }).join(',');
    let rel = relation || 'AND'
    let criteria = SpreadsheetApp.newFilterCriteria()
        .whenFormulaSatisfied(`= ${rel} (${exps})`)
        .build();
    filter.setColumnFilterCriteria(2, criteria);
}

/**
 * Remove all filters
 */
function removeFilters() {
    let ss = SpreadsheetApp.getActiveSheet();
    let filter = ss.getFilter();
    if (filter) {
        filter.remove();
    }
}

/**
 * Extract all labels from all visible rows
 */
function extractLabels() {
    let ss = SpreadsheetApp.getActiveSheet();
    let lastIndex = ss.getLastRow();
    let range = ss.getRange(1, 2, lastIndex);
    let values = range.getValues();
    let labelSet = new Map();

    values
        .filter((v, i) => !ss.isRowHiddenByUser(i + 1))
        .forEach((value) => {
            let title = value[0];
            let matches = title.match(/(?<=\[)(.+?)(?=\])/g);
            matches?.forEach((match) => {
                labelSet.set(match.toLowerCase(), match)
            })
        })
    let list = Array.from(labelSet.values());
    return JSON.stringify(list);
}