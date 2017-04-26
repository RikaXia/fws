'use strict';

const ts = require('typescript');


// let ts2js = (src,dist,isDebug)=>{
//     let program = ts.createProgram(src,{
//         noEmitOnError:true,
//         noImplicitAny: true,
//         target: ts.ScriptTarget.ES5,
//         module: ts.ModuleKind.CommonJS
//     });
//     let emitResult = program.emit();

//     var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

//     allDiagnostics.forEach(function (diagnostic) {
//         var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
//         var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
//         console.log(diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message);
//     });
//     var exitCode = emitResult.emitSkipped ? 1 : 0;

//     console.log(exitCode);



// };

function ts2js(fileNames, options) {
    var servicesHost = {
        getScriptFileNames: function () { return rootFileNames; },
        getScriptVersion: function (fileName) { return files[fileName] && files[fileName].version.toString(); },
        getScriptSnapshot: function (fileName) {
            if (!fs.existsSync(fileName)) {
                return undefined;
            }
            return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
        },
        getCurrentDirectory: function () { return process.cwd(); },
        getCompilationSettings: function () { return options; },
        getDefaultLibFileName: function (options) { return ts.getDefaultLibFilePath(options); },
    };
    var services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
    var output = services.getEmitOutput(fileName);
}


module.exports = ts2js;