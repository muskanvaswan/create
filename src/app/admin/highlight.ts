/**
 * Text highlighting for the note editor. Highlights are stored as <mark>
 * elements, which survive the markdown round trip as inline HTML. This is
 * done with DOM edits rather than execCommand("hiliteColor"), which emits
 * styled spans that the markdown styles deliberately neutralise.
 */

// Containers whose whitespace-only text nodes are markup indentation, not text.
const STRUCTURAL = new Set(["UL", "OL", "TABLE", "THEAD", "TBODY", "TR"]);

function markOf(node: Node, root: HTMLElement): HTMLElement | null {
  const mark = node.parentElement?.closest("mark") ?? null;
  return mark && root.contains(mark) ? mark : null;
}

function isHighlightable(text: Text, root: HTMLElement): boolean {
  if (!text.data) return false;
  const parent = text.parentElement;
  if (!parent || parent.closest("pre, code")) return false;
  return /\S/.test(text.data) || (parent !== root && !STRUCTURAL.has(parent.tagName));
}

/**
 * Text nodes covered by the range, split at its edges so every returned node
 * is selected in full.
 */
function selectedTextNodes(root: HTMLElement, range: Range): Text[] {
  let { startContainer: start, startOffset, endContainer: end, endOffset } = range;
  // Split the end first so the start offset stays valid when both are one node.
  if (end instanceof Text) {
    end.splitText(endOffset);
    endOffset = end.length;
  }
  if (start instanceof Text) {
    const tail = start.splitText(startOffset);
    if (end === start) {
      end = tail;
      endOffset = tail.length;
    }
    start = tail;
    startOffset = 0;
  }
  const bounds = document.createRange();
  bounds.setStart(start, startOffset);
  bounds.setEnd(end, endOffset);

  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    if (bounds.intersectsNode(text) && isHighlightable(text, root)) {
      nodes.push(text);
    }
  }
  return nodes;
}

function wrap(text: Text) {
  const mark = document.createElement("mark");
  text.replaceWith(mark);
  mark.append(text);
}

/** Join marks left directly next to each other, e.g. after extending a highlight. */
function mergeAdjacentMarks(root: HTMLElement) {
  for (const mark of root.querySelectorAll("mark")) {
    let prev = mark.previousSibling;
    while (prev instanceof Text && !prev.data) {
      const empty = prev;
      prev = prev.previousSibling;
      empty.remove();
    }
    if (prev instanceof HTMLElement && prev.tagName === "MARK") {
      prev.append(...mark.childNodes);
      mark.remove();
    }
  }
}

/** Whether the caret (or the start of the selection) is in highlighted text. */
export function isHighlighted(): boolean {
  const node = window.getSelection()?.anchorNode;
  const element = node instanceof Element ? node : node?.parentElement;
  return Boolean(element?.closest("mark"));
}

/**
 * Highlight the selected text, or remove the highlight when all of it is
 * already highlighted. With a bare caret, removes the highlight it sits in.
 * Returns whether the note changed.
 */
export function toggleHighlight(root: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;

  if (range.collapsed) {
    const mark = markOf(range.startContainer, root);
    if (!mark) return false;
    mark.replaceWith(...mark.childNodes);
    root.normalize();
    return true;
  }

  const nodes = selectedTextNodes(root, range);
  if (nodes.length === 0) return false;

  const marks = new Set(nodes.map((text) => markOf(text, root)));
  if (marks.has(null)) {
    for (const text of nodes) {
      if (!markOf(text, root)) wrap(text);
    }
  } else {
    // Unwrap each touched highlight, then re-highlight the parts of it that
    // weren't selected so only the selection loses its highlight.
    const selected = new Set(nodes);
    for (const mark of marks as Set<HTMLElement>) {
      const walker = document.createTreeWalker(mark, NodeFilter.SHOW_TEXT);
      const keep: Text[] = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node as Text;
        if (!selected.has(text) && isHighlightable(text, root)) keep.push(text);
      }
      mark.replaceWith(...mark.childNodes);
      keep.forEach(wrap);
    }
  }

  mergeAdjacentMarks(root);
  const last = nodes[nodes.length - 1];
  selection.setBaseAndExtent(nodes[0], 0, last, last.length);
  // Re-join the text nodes split above; live ranges (the selection) follow.
  root.normalize();
  return true;
}
