const vscode = require('vscode');

function toPascalCase(str) {
	str = str.replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1));

	let _strArray = str.split("_");
	let resultStr = "";
	if (_strArray.length > 0) {
		for (const str of _strArray) {
			resultStr += str[0].toUpperCase() + str.slice(1);
		}
	}
	return resultStr
}

function pascalToCamelCase(str) {
	return str.replace(/\w+/g, w => w[0].toLowerCase() + w.slice(1));
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('sthgettersetter.gettersetter', function () {
		var activeTextEditor = vscode.window.activeTextEditor;
		if (!activeTextEditor)
			return; // No open text editor

		var selection = activeTextEditor.selection;
		var text = activeTextEditor.document.getText(selection);

		if (text.length < 1) {
			vscode.window.showErrorMessage('กรุณาไฮไลท์ที่ตัวอักษร ชื่อคอลัมภ์ของtable หรือ ชื่อตัวแปร');
			return;
		}

		try {
			var outputResult = generateGetterAndSetter(text);

			activeTextEditor.edit(
				edit => activeTextEditor.selections.forEach(
					selection => {
						edit.insert(selection.end, outputResult);
					}
				)
			);
			vscode.commands.executeCommand('editor.action.formatSelection');
		}
		catch (error) {
			vscode.window.showErrorMessage('กรุณาไฮไลท์ที่อักษร ไม่ใช่ช่องว่าง หรือ spacebar');
		}
	});

	context.subscriptions.push(disposable);

}


function generateGetterAndSetter(textPorperties) {

	var properties = textPorperties.split(/\r?\n/).filter((/** @type {string | any[]} */ x) => x.length > 2).map((/** @type {string} */ x) => x.replace(';', ''));

	var generatedCode = ``;

	for (let p of properties) {

		while (p.startsWith(" ")) p = p.substr(1);
		while (p.startsWith("\t")) p = p.substr(1);

		let words = p.split(" ").map(x => x.replace(/\r?\n/, ''));
		let Attribute = "";
		let create = false;

		if (words.length) {
			Attribute = toPascalCase(words[0]);
			create = true;
		}

		if (create) {

			let code = `
                    \tget get${Attribute}() {
                    \t\treturn this.${pascalToCamelCase(Attribute)};
                    \t}

                    \tset set${Attribute}(${pascalToCamelCase(Attribute)}) {
                    \t\tthis.${pascalToCamelCase(Attribute)} = ${pascalToCamelCase(Attribute)};
                    \t}
                `;
			generatedCode += code;
		}
	}

	return generatedCode;

}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
