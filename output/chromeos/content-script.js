//Note: we added context menu items to convert text in the background worker,
//and then the background worker sends the converted text to the content script.
//The content script then replaces the selected text with the converted text.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  function replaceSelectedText(replacementText, isHtml) {
    let sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      const activeElement = document.activeElement;
      if (
        activeElement.nodeName === 'TEXTAREA' ||
        (activeElement.nodeName === 'INPUT' && activeElement.type.toLowerCase() === 'text')
      ) {
        const val = activeElement.value;
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        activeElement.value = val.slice(0, start) + replacementText + val.slice(end);
      } else {
        if (sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          if (isHtml) {
            const div = document.createElement('div');
            div.innerHTML = replacementText;
            range.insertNode(div);
          } else {
            const lines = replacementText.split('\n').reverse();
            if (lines.length > 1) {
              for (const line of lines) {
                const p = document.createElement('p');
                p.innerText = line;
                range.insertNode(p);
              }
            } else {
              range.insertNode(document.createTextNode(replacementText));
            }
          }
        } else {
          sel.deleteFromDocument();
        }
      }
    } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      range.text = replacementText;
    }
  }

  function beep() {
    const snd = new Audio(
      'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=',
    );
    snd.play();
  }

  function createLookUpResult(chr, lookupResults) {
    const results = JSON.parse(lookupResults);
    // You can now use `results` as a JS object/array.
    let div = document.getElementById('mctabim-lookup-result');
    if (div) {
      div.remove();
    }
    div = document.createElement('div');
    div.id = 'mctabim-lookup-result';
    div.style.position = 'fixed';
    div.style.left = '20px';
    div.style.top = '20px';
    div.style.width = '200px';
    div.style.background = 'yellow';
    div.style.border = '1px solid #ccc';
    div.style.zIndex = '9999';
    div.style.padding = '8px';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '[X]';
    closeBtn.style.float = 'right';
    closeBtn.onclick = () => {
      div.remove();
    };
    div.appendChild(closeBtn);

    const pre = document.createElement('pre');
    pre.id = 'mctabim-lookup-result-content';
    div.appendChild(pre);
    document.body.appendChild(div);
    // Render results as a table
    pre.textContent = ''; // Clear previous content

    // Create a container div for the table and description
    const container = document.createElement('div');
    container.style.marginTop = '8px';

    // Add a <p> before the table
    const desc = document.createElement('p');
    desc.textContent = `「${chr}」的輸入法查詢結果：`;
    desc.style.fontSize = '10pt';
    desc.style.marginBottom = '4px';
    container.appendChild(desc);

    if (!results || results.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = '查無輸入法查詢結果。';
      emptyMsg.style.fontSize = '10pt';
      emptyMsg.style.color = '#666';
      emptyMsg.style.margin = '8px 0';
      container.appendChild(emptyMsg);
    } else {
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '10pt';

      // Table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const thName = document.createElement('th');
      thName.style.fontWeight = 'bold';
      thName.textContent = '輸入法';
      thName.style.border = '1px solid #ccc';
      thName.style.padding = '4px';
      const thRadicals = document.createElement('th');
      thRadicals.style.fontWeight = 'bold';
      thRadicals.textContent = '字根';
      thRadicals.style.border = '1px solid #ccc';
      thRadicals.style.padding = '4px';
      headerRow.appendChild(thName);
      headerRow.appendChild(thRadicals);
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Table body
      const tbody = document.createElement('tbody');
      for (const item of results) {
        const row = document.createElement('tr');
        const tdName = document.createElement('td');
        tdName.textContent = item.inputTableName;
        tdName.style.border = '1px solid #ccc';
        tdName.style.padding = '4px';
        const tdRadicals = document.createElement('td');
        tdRadicals.textContent = Array.isArray(item.radicals) ? item.radicals.join(', ') : '';
        tdRadicals.style.border = '1px solid #ccc';
        tdRadicals.style.padding = '4px';
        row.appendChild(tdName);
        row.appendChild(tdRadicals);
        tbody.appendChild(row);
      }
      table.appendChild(tbody);
      // Append table to container
      container.appendChild(table);
    }
    // Replace pre with container
    pre.replaceWith(container);
    // Replace pre with table
    pre.replaceWith(table);
  }

  if (request.command === 'beep') {
    beep();
  } else if (request.command === 'send_lookup_result') {
    const lookupResults = request.text;
    const char = request.char;
    createLookUpResult(char, lookupResults);
  } else if (request.command === 'replace_text') {
    const text = request.text;
    const isHtml = request.isHtml;
    replaceSelectedText(text, isHtml);
  }
});

// console.log('McTabim content script loaded.');
