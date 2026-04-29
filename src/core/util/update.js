/* eslint-disable no-eq-null */
/* eslint-disable no-empty */
/* eslint-disable eqeqeq */
/* eslint-disable brace-style */
/* eslint-disable semi */
/* eslint-disable object-curly-spacing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable indent */
/* eslint-disable quotes */
"use strict";
const path = require('path');
function fileContentUpdates({ result }) {
    return new Promise((resolve, reject) => {
        const updatePreview = document.getElementById('updatePreview');
        const updatePreviewInstance = M.Modal.init(updatePreview, {
            dismissible: false,
            onCloseEnd: function () {
                codePreviewEditor.dispose();
                updatePreviewInstance.destroy();
                resolve(result);
            },
        });
        updatePreviewInstance.open();
        const codePreviewEditor = monaco.editor.createDiffEditor(document.getElementById('codePreview'), {
            codeLens: true,
            readOnly: true,
            originalEditable: true,
        });
        document.getElementById('commit').addEventListener('click', function (e) {
            const UpdatedContent = codePreviewEditor
                .getOriginalEditor()
                .getModel()
                .getValue();
            const outputPath = path.normalize(codePreviewEditor.getOriginalEditor().getModel().uri.fsPath);
            const index = result.findIndex(i => monaco.Uri.file(i.outputPath).fsPath === path.normalize(outputPath));
            result[index].outputContent = UpdatedContent;
            result[index].doneUpdate = true;
            const treeEle = document.getElementById('tree');
            treeEle.querySelector(`a[id="${result[index].id}"]`).remove();
            if (treeEle.childNodes.length === 0) {
                updatePreviewInstance.close();
            }
            else {
                treeEle.querySelector('a').click();
            }
        });
        const tree = document.createElement('div');
        tree.id = 'tree';
        const fileLinks = result.reduce((acc, cur) => {
            if (cur.isUpdate) {
                const p = document.createElement('a');
                p.id = cur.id;
                p.href = '#';
                p.innerHTML = path.basename(cur.outputPath);
                p.data = cur;
                p.outputPath = monaco.Uri.file(cur.outputPath).fsPath;
                p.diffEditorInstance = codePreviewEditor;
                p.addEventListener('click', addToEditor, false);
                p.style.display = 'block';
                acc.appendChild(p);
            }
            return acc;
        }, tree);
        document.getElementById('treeContainer').innerHTML = '';
        document.getElementById('treeContainer').appendChild(fileLinks);
        tree.querySelector('a').click();
    });
}
// update preview function
function addToEditor({ target: { data, diffEditorInstance, outputPath } }) {
    const selectedValue = null;
    const currentModels = monaco.editor.getModels();
    if (currentModels.length > 1) {
        const [dslEditor, diff1, diff2] = currentModels;
        diff1.dispose();
        diff2.dispose();
    }
    const originalModel = monaco.editor.createModel(data.originalContent, undefined, monaco.Uri.file(outputPath));
    const modifiedModel = monaco.editor.createModel(data.outputContent, 'text/plain');
    diffEditorInstance.setModel({
        original: originalModel,
        modified: modifiedModel,
        followsCaret: true,
        ignoreCharChanges: true,
    });
    // console.log({ diffEditorInstance, res });
    document.getElementById('acceptCurrent').addEventListener('click', () => {
        const lineChanges = diffEditorInstance.getLineChanges();
        const maxLineColumn = diffEditorInstance
            .getOriginalEditor()
            .getModel()
            .getLineMaxColumn(diffEditorInstance.getOriginalEditor().getModel().getLineCount());
        const maxLineCountBefore = diffEditorInstance
            .getOriginalEditor()
            .getModel()
            .getLineCount();
        let range = null;
        let content = null;
        for (let index = 0; index < lineChanges.length; index++) {
            // console.log(
            //     lineChanges[index].originalStartLineNumber +
            //       " " +
            //       diffEditorInstance.getDiffLineInformationForModified(
            //         diffEditorInstance.getPosition().lineNumber
            //       ).equivalentLineNumber
            //   );
            if (lineChanges[index].charChanges == undefined &&
                lineChanges[index].originalEndLineNumber == 0 &&
                diffEditorInstance.getDiffLineInformationForModified(diffEditorInstance.getPosition().lineNumber).equivalentLineNumber == lineChanges[index].originalStartLineNumber) {
                // Add lines
                // console.log(
                //   diffEditorInstance.getOriginalEditor().getModel().getLineCount() +
                //     " ~~ " +
                //     maxLineColumn
                // );
                range = new monaco.Range(lineChanges[index].originalStartLineNumber, 1, lineChanges[index].originalStartLineNumber, 100);
                const originalEditorContentRange = new monaco.Range(lineChanges[index].originalStartLineNumber, 1, lineChanges[index].originalStartLineNumber, 100);
                const modifiedEditorContentRange = new monaco.Range(lineChanges[index].modifiedStartLineNumber, 1, lineChanges[index].modifiedEndLineNumber, 100);
                // console.log(originalEditorContentRange);
                // console.log(modifiedEditorContentRange);
                const originalContent = diffEditorInstance
                    .getOriginalEditor()
                    .getModel()
                    .getValueInRange(originalEditorContentRange);
                const modifiedContent = diffEditorInstance
                    .getModifiedEditor()
                    .getModel()
                    .getValueInRange(modifiedEditorContentRange);
                // console.log(originalContent);
                // console.log(modifiedContent);
                content = originalContent + '\n' + modifiedContent;
                // console.log("content" + content);
                break;
            }
            if (lineChanges[index].charChanges != undefined &&
                lineChanges[index].originalEndLineNumber != 0 &&
                diffEditorInstance.getDiffLineInformationForModified(diffEditorInstance.getPosition().lineNumber).equivalentLineNumber == lineChanges[index].originalStartLineNumber) {
                range = new monaco.Range(lineChanges[index].originalStartLineNumber, 1, lineChanges[index].originalEndLineNumber, 100);
                content = diffEditorInstance
                    .getModifiedEditor()
                    .getModel()
                    .getValueInRange(range);
                // console.log("content" + content);
                break;
            }
        }
        if (content != null) {
            const lines = diffEditorInstance.getDiffLineInformationForModified();
            // console.log(range);
            // console.log(lineChanges);
            diffEditorInstance
                .getOriginalEditor()
                .executeEdits('', [{ range: range, text: content }]);
        }
    });
    const navi = monaco.editor.createDiffNavigator(diffEditorInstance, {
        followsCaret: true,
        ignoreCharChanges: true,
    });
    function highlightFocusChange(position) {
        const lineChanges = diffEditorInstance.getLineChanges();
        const elems = document.querySelectorAll('.myInlineDiffDecoration');
        // console.log(elems);
        [].forEach.call(elems, function (el) {
            el.classList.remove('myInlineDiffDecoration');
        });
        for (let index = 0; index < lineChanges.length; index++) {
            if (position.lineNumber >= lineChanges[index].originalStartLineNumber &&
                position.lineNumber <= lineChanges[index].originalEndLineNumber) {
                diffEditorInstance
                    .getModifiedEditor()
                    .getModel()
                    .deltaDecorations([], [
                    {
                        range: new monaco.Range(lineChanges[index].modifiedStartLineNumber, 1, lineChanges[index].modifiedEndLineNumber, 100),
                        options: { inlineClassName: 'myInlineDiffDecoration' },
                    },
                ]);
                diffEditorInstance
                    .getOriginalEditor()
                    .getModel()
                    .deltaDecorations([], [
                    {
                        range: new monaco.Range(lineChanges[index].modifiedStartLineNumber, 1, lineChanges[index].modifiedEndLineNumber, 100),
                        options: { inlineClassName: 'myInlineDiffDecoration' },
                    },
                ]);
            }
            else {
            }
        }
    }
    document.getElementById('previousChange').addEventListener('click', () => {
        navi.previous();
        highlightFocusChange(diffEditorInstance.getPosition());
    });
    document.getElementById('nextChange').addEventListener('click', () => {
        navi.next();
        highlightFocusChange(diffEditorInstance.getPosition());
    });
    diffEditorInstance.getModifiedEditor().onMouseDown(function (e) {
        highlightFocusChange(e.target.position);
    });
    //   document.getElementById("acceptBoth").addEventListener("click", () => {
    //     var lineChanges = diffEditorInstance.getLineChanges();
    //     let maxLineColumn = diffEditorInstance
    //       .getOriginalEditor()
    //       .getModel()
    //       .getLineMaxColumn(
    //         diffEditorInstance.getOriginalEditor().getModel().getLineCount()
    //       );
    //     let maxLineCountBefore = diffEditorInstance
    //       .getOriginalEditor()
    //       .getModel()
    //       .getLineCount();
    //     let range = null;
    //     let content = null;
    //     for (let index = 0; index < lineChanges.length; index++) {
    //       //console.log(
    //         lineChanges[index].originalStartLineNumber +
    //           " " +
    //           diffEditorInstance.getDiffLineInformationForModified(
    //             diffEditorInstance.getPosition().lineNumber
    //           ).equivalentLineNumber
    //       );
    //       //Add lines
    //       //console.log(
    //         diffEditorInstance.getOriginalEditor().getModel().getLineCount() +
    //           " ~~ " +
    //           maxLineColumn
    //       );
    //       range = new monaco.Range(
    //         lineChanges[index].originalStartLineNumber,
    //         1,
    //         lineChanges[index].originalStartLineNumber,
    //         1
    //       );
    //       let originalEditorContentRange = new monaco.Range(
    //         lineChanges[index].originalStartLineNumber,
    //         1,
    //         lineChanges[index].originalStartLineNumber,
    //         100
    //       );
    //       let modifiedEditorContentRange = new monaco.Range(
    //         lineChanges[index].modifiedStartLineNumber,
    //         1,
    //         lineChanges[index].modifiedEndLineNumber,
    //         100
    //       );
    //       //console.log(originalEditorContentRange);
    //       //console.log(modifiedEditorContentRange);
    //       let originalContent = diffEditorInstance
    //         .getOriginalEditor()
    //         .getModel()
    //         .getValueInRange(originalEditorContentRange);
    //       let modifiedContent = diffEditorInstance
    //         .getModifiedEditor()
    //         .getModel()
    //         .getValueInRange(modifiedEditorContentRange);
    //       //console.log(originalContent);
    //       //console.log(modifiedContent);
    //       content = originalContent + "\n" + modifiedContent + "\n";
    //       //console.log("content" + content);
    //       break;
    //     }
    //     if (content != null) {
    //       var lines = diffEditorInstance.getDiffLineInformationForModified();
    //       //console.log(range);
    //       //console.log(lineChanges);
    //       diffEditorInstance
    //         .getOriginalEditor()
    //         .executeEdits("", [{ range: range, text: content }]);
    //       diffEditorInstance
    //         .getModifiedEditor()
    //         .executeEdits("", [{ range: range, text: content }]);
    //     }
    //   });
}
module.exports = { fileContentUpdates };
