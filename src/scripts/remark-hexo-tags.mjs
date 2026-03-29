import { visit } from 'unist-util-visit';

export function remarkHexoTags() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      // 匹配 {% video bilibili:BVxxx %} 和 {% image url %}
      const regex = /\{%\s*(video|image)\s+(.+?)\s*%\}/g;
      const matches = [...node.value.matchAll(regex)];

      if (matches.length === 0) return;

      const newNodes = [];
      let lastIndex = 0;

      for (const match of matches) {
        // 添加匹配前的纯文本
        if (match.index > lastIndex) {
          newNodes.push({
            type: 'text',
            value: node.value.substring(lastIndex, match.index)
          });
        }

        const tagType = match[1];
        const content = match[2].trim();

        if (tagType === 'video' && content.startsWith('bilibili:')) {
          const bvid = content.replace('bilibili:', '').trim();
          newNodes.push({
            type: 'html',
            value: `<div class="video-container animate-up"><iframe src="//player.bilibili.com/player.html?bvid=${bvid}&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe></div>`
          });
        } else if (tagType === 'image') {
          const parts = content.split(/\\s+/);
          const imgSrc = parts.length > 1 ? parts[parts.length - 1] : parts[0];
          newNodes.push({
            type: 'html',
            value: `<img src="${imgSrc}" alt="Image" class="animate-up" />`
          });
        }

        lastIndex = match.index + match[0].length;
      }

      // 添加剩余的文本
      if (lastIndex < node.value.length) {
        newNodes.push({
          type: 'text',
          value: node.value.substring(lastIndex)
        });
      }

      parent.children.splice(index, 1, ...newNodes);
    });
  };
}
