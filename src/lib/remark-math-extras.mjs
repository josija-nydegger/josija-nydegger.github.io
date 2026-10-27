// Remark-Plugin, läuft nach remark-math:
// 1. Ein Absatz, der nur aus $$…$$ besteht, wird zur Block-Formel (wie bisher mit kramdown).
//    remark-math selbst erkennt Blöcke nur, wenn $$ allein auf einer Zeile steht.
// 2. Merkt sich im Front Matter (math: true), ob ein Beitrag Formeln enthält.
//    So lädt src/layouts/Post.astro das KaTeX-Stylesheet nur dort, wo es gebraucht wird.
import { visit, SKIP } from 'unist-util-visit';

export default function remarkMathExtras() {
  return (tree, file) => {
    const source = String(file.value);
    let found = false;
    visit(tree, (node, index, parent) => {
      if (node.type === 'math' || node.type === 'inlineMath') found = true;
      if (node.type !== 'paragraph' || node.children.length !== 1 || !parent) return;
      const child = node.children[0];
      if (child.type !== 'inlineMath') return;
      const raw = source.slice(child.position.start.offset, child.position.end.offset);
      if (!raw.startsWith('$$')) return;
      found = true;
      parent.children[index] = {
        type: 'math',
        value: child.value,
        position: node.position,
        data: { hName: 'pre', hChildren: [{ type: 'element', tagName: 'code', properties: { className: ['language-math', 'math-display'] }, children: [{ type: 'text', value: child.value }] }] }
      };
      return SKIP;
    });
    if (found) file.data.astro.frontmatter.math = true;
  };
}
