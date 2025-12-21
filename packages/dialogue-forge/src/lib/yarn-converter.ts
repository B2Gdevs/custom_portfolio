import { DialogueTree, DialogueNode } from '../types';

/**
 * Convert DialogueTree to Yarn Spinner format
 * 
 * Flags are converted to Yarn variables ($variable).
 * Variables are NOT stored in the .yarn file - they're managed by
 * Yarn Spinner's Variable Storage at runtime.
 * 
 * The .yarn file contains commands like:
 * - <<set $flag_name = value>> - Sets variable in Variable Storage
 * - <<if $flag_name>> - Checks variable in Variable Storage
 */
export function exportToYarn(tree: DialogueTree): string {
  let yarn = '';
  
  Object.values(tree.nodes).forEach(node => {
    yarn += `title: ${node.id}\n`;
    yarn += `---\n`;
    
    if (node.type === 'npc') {
      // Export conditional blocks if present
      if (node.conditionalBlocks && node.conditionalBlocks.length > 0) {
        node.conditionalBlocks.forEach(block => {
          if (block.type === 'if' || block.type === 'elseif') {
            // Build condition string
            const conditions = block.condition?.map(cond => {
              const varName = `$${cond.flag}`;
              if (cond.operator === 'is_set') {
                return varName;
              } else if (cond.operator === 'is_not_set') {
                return `not ${varName}`;
              } else if (cond.value !== undefined) {
                const op = cond.operator === 'equals' ? '==' :
                          cond.operator === 'not_equals' ? '!=' :
                          cond.operator === 'greater_than' ? '>' :
                          cond.operator === 'less_than' ? '<' :
                          cond.operator === 'greater_equal' ? '>=' :
                          cond.operator === 'less_equal' ? '<=' : '==';
                const value = typeof cond.value === 'string' ? `"${cond.value}"` : cond.value;
                return `${varName} ${op} ${value}`;
              }
              return '';
            }).filter(c => c).join(' and ') || '';
            
            yarn += `<<${block.type} ${conditions}>>\n`;
          } else if (block.type === 'else') {
            yarn += `<<else>>\n`;
          }
          
          // Export block content
          if (block.speaker) {
            yarn += `${block.speaker}: ${block.content.replace(/\n/g, '\n' + block.speaker + ': ')}\n`;
          } else {
            yarn += `${block.content}\n`;
          }
        });
        yarn += `<<endif>>\n`;
      } else {
        // Regular content (no conditionals)
        if (node.speaker) {
          yarn += `${node.speaker}: ${node.content.replace(/\n/g, '\n' + node.speaker + ': ')}\n`;
        } else {
          yarn += `${node.content}\n`;
        }
      }
      
      // Export flags as Yarn variable commands
      // These commands tell Yarn Spinner to update Variable Storage at runtime
      if (node.setFlags?.length) {
        node.setFlags.forEach(flag => {
          yarn += `<<set $${flag} = true>>\n`;
        });
      }
      
      if (node.nextNodeId) {
        yarn += `<<jump ${node.nextNodeId}>>\n`;
      }
    } else if (node.type === 'conditional' && node.conditionalBlocks) {
      // Export conditional node blocks
      node.conditionalBlocks.forEach(block => {
        if (block.type === 'if' || block.type === 'elseif') {
          // Build condition string
          const conditions = block.condition?.map(cond => {
            const varName = `$${cond.flag}`;
            if (cond.operator === 'is_set') {
              return varName;
            } else if (cond.operator === 'is_not_set') {
              return `not ${varName}`;
            } else if (cond.value !== undefined) {
              const op = cond.operator === 'equals' ? '==' :
                        cond.operator === 'not_equals' ? '!=' :
                        cond.operator === 'greater_than' ? '>' :
                        cond.operator === 'less_than' ? '<' :
                        cond.operator === 'greater_equal' ? '>=' :
                        cond.operator === 'less_equal' ? '<=' : '==';
              const value = typeof cond.value === 'string' ? `"${cond.value}"` : cond.value;
              return `${varName} ${op} ${value}`;
            }
            return '';
          }).filter(c => c).join(' and ') || '';
          
          yarn += `<<${block.type} ${conditions}>>\n`;
        } else if (block.type === 'else') {
          yarn += `<<else>>\n`;
        }
        
        // Export block content
        if (block.speaker) {
          yarn += `${block.speaker}: ${block.content.replace(/\n/g, '\n' + block.speaker + ': ')}\n`;
        } else {
          yarn += `${block.content}\n`;
        }
        
        // Export block's nextNodeId if present
        if (block.nextNodeId) {
          yarn += `<<jump ${block.nextNodeId}>>\n`;
        }
      });
      yarn += `<<endif>>\n`;
      
      // Export flags as Yarn variable commands
      if (node.setFlags?.length) {
        node.setFlags.forEach(flag => {
          yarn += `<<set $${flag} = true>>\n`;
        });
      }
      
      // Conditional nodes don't have a main nextNodeId (each block has its own)
    } else if (node.type === 'player' && node.choices) {
      node.choices.forEach(choice => {
        // Export conditions as Yarn if statements (wrap the choice)
        if (choice.conditions && choice.conditions.length > 0) {
          // Combine multiple conditions with AND logic
          const conditions = choice.conditions.map(cond => {
            const varName = `$${cond.flag}`;
            if (cond.operator === 'is_set') {
              return varName;
            } else if (cond.operator === 'is_not_set') {
              return `not ${varName}`;
            } else if (cond.value !== undefined) {
              // Comparison operators
              const op = cond.operator === 'equals' ? '==' :
                        cond.operator === 'not_equals' ? '!=' :
                        cond.operator === 'greater_than' ? '>' :
                        cond.operator === 'less_than' ? '<' :
                        cond.operator === 'greater_equal' ? '>=' :
                        cond.operator === 'less_equal' ? '<=' : '==';
              const value = typeof cond.value === 'string' ? `"${cond.value}"` : cond.value;
              return `${varName} ${op} ${value}`;
            }
            return '';
          }).filter(c => c).join(' and ');
          
          if (conditions) {
            yarn += `<<if ${conditions}>>\n`;
          }
        }
        
        yarn += `-> ${choice.text}\n`;
        
        // Export flags set by this choice
        if (choice.setFlags?.length) {
          choice.setFlags.forEach(flag => {
            yarn += `    <<set $${flag} = true>>\n`;
          });
        }
        if (choice.nextNodeId) {
          yarn += `    <<jump ${choice.nextNodeId}>>\n`;
        }
        
        if (choice.conditions && choice.conditions.length > 0) {
          yarn += `<<endif>>\n`;
        }
      });
    }
    
    yarn += `===\n\n`;
  });
  
  return yarn;
}

/**
 * Parse Yarn Spinner format to DialogueTree
 */
export function importFromYarn(yarnContent: string, title: string = 'Imported Dialogue'): DialogueTree {
  const nodes: Record<string, DialogueNode> = {};
  const nodeBlocks = yarnContent.split('===').filter(b => b.trim());
  
  let y = 50;
  nodeBlocks.forEach((block, idx) => {
    const titleMatch = block.match(/title:\s*(\S+)/);
    if (!titleMatch) return;
    
    const nodeId = titleMatch[1];
    const contentStart = block.indexOf('---');
    if (contentStart === -1) return;
    
    const content = block.slice(contentStart + 3).trim();
    const lines = content.split('\n').filter(l => l.trim());
    
    const choices: any[] = [];
    let dialogueContent = '';
    let speaker = '';
    const setFlags: string[] = [];
    let nextNodeId = '';
    const conditionalBlocks: any[] = [];
    
    // Track conditional block state
    let inConditionalBlock = false;
    let currentBlock: any = null;
    let blockContent: string[] = [];
    let blockSpeaker: string = '';
    
    const parseCondition = (conditionStr: string): any[] => {
      // Parse condition string like "$flag", "not $flag", "$flag == 5", etc.
      const conditions: any[] = [];
      
      // Split by 'and' for multiple conditions
      const parts = conditionStr.split(/\s+and\s+/i);
      
      parts.forEach(part => {
        part = part.trim();
        if (part.startsWith('not ')) {
          const varMatch = part.match(/not\s+\$(\w+)/);
          if (varMatch) {
            conditions.push({ flag: varMatch[1], operator: 'is_not_set' });
          }
        } else if (part.includes('==')) {
          const match = part.match(/\$(\w+)\s*==\s*(.+)/);
          if (match) {
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            conditions.push({ flag: match[1], operator: 'equals', value });
          }
        } else if (part.includes('!=')) {
          const match = part.match(/\$(\w+)\s*!=\s*(.+)/);
          if (match) {
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            conditions.push({ flag: match[1], operator: 'not_equals', value });
          }
        } else if (part.includes('>=')) {
          const match = part.match(/\$(\w+)\s*>=\s*(.+)/);
          if (match) {
            conditions.push({ flag: match[1], operator: 'greater_equal', value: parseFloat(match[2]) });
          }
        } else if (part.includes('<=')) {
          const match = part.match(/\$(\w+)\s*<=\s*(.+)/);
          if (match) {
            conditions.push({ flag: match[1], operator: 'less_equal', value: parseFloat(match[2]) });
          }
        } else if (part.includes('>')) {
          const match = part.match(/\$(\w+)\s*>\s*(.+)/);
          if (match) {
            conditions.push({ flag: match[1], operator: 'greater_than', value: parseFloat(match[2]) });
          }
        } else if (part.includes('<')) {
          const match = part.match(/\$(\w+)\s*<\s*(.+)/);
          if (match) {
            conditions.push({ flag: match[1], operator: 'less_than', value: parseFloat(match[2]) });
          }
        } else {
          // Simple flag check
          const varMatch = part.match(/\$(\w+)/);
          if (varMatch) {
            conditions.push({ flag: varMatch[1], operator: 'is_set' });
          }
        }
      });
      
      return conditions;
    };
    
    lines.forEach(line => {
      const trimmed = line.trim();
      // Skip empty lines
      if (!trimmed) return;
      
      if (trimmed.startsWith('->')) {
        const choiceText = trimmed.slice(2).trim();
        choices.push({ id: `c_${Date.now()}_${choices.length}`, text: choiceText, nextNodeId: '' });
      } else if (trimmed.startsWith('<<jump')) {
        const jumpMatch = trimmed.match(/<<jump\s+(\S+)>>/);
        if (jumpMatch) {
          if (choices.length > 0) {
            choices[choices.length - 1].nextNodeId = jumpMatch[1];
          } else {
            nextNodeId = jumpMatch[1];
          }
        }
      } else if (trimmed.startsWith('<<set')) {
        // Match: <<set $var = value>> or <<set $var += value>>
        const setMatch = trimmed.match(/<<set\s+\$(\w+)\s*(?:[=+\-*/]|==|!=|<=|>=)?\s*([^>]*?)>>/);
        if (setMatch) {
          const varName = setMatch[1];
          if (choices.length > 0) {
            if (!choices[choices.length - 1].setFlags) {
              choices[choices.length - 1].setFlags = [];
            }
            choices[choices.length - 1].setFlags.push(varName);
          } else {
            setFlags.push(varName);
          }
        }
      } else if (trimmed.startsWith('<<if')) {
        // Start of conditional block
        if (inConditionalBlock && currentBlock) {
          // Save previous block
          currentBlock.content = blockContent.join('\n').trim();
          currentBlock.speaker = blockSpeaker || undefined;
          conditionalBlocks.push(currentBlock);
        }
        
        inConditionalBlock = true;
        const conditionStr = trimmed.replace(/<<if\s+/, '').replace(/>>/, '').trim();
        currentBlock = {
          id: `block_${Date.now()}_${conditionalBlocks.length}`,
          type: 'if',
          condition: parseCondition(conditionStr),
          content: '',
          speaker: undefined
        };
        blockContent = [];
        blockSpeaker = '';
      } else if (trimmed.startsWith('<<elseif')) {
        // Elseif block
        if (currentBlock) {
          currentBlock.content = blockContent.join('\n').trim();
          currentBlock.speaker = blockSpeaker || undefined;
          conditionalBlocks.push(currentBlock);
        }
        
        const conditionStr = trimmed.replace(/<<elseif\s+/, '').replace(/>>/, '').trim();
        currentBlock = {
          id: `block_${Date.now()}_${conditionalBlocks.length}`,
          type: 'elseif',
          condition: parseCondition(conditionStr),
          content: '',
          speaker: undefined
        };
        blockContent = [];
        blockSpeaker = '';
      } else if (trimmed.startsWith('<<else')) {
        // Else block
        if (currentBlock) {
          currentBlock.content = blockContent.join('\n').trim();
          currentBlock.speaker = blockSpeaker || undefined;
          conditionalBlocks.push(currentBlock);
        }
        
        currentBlock = {
          id: `block_${Date.now()}_${conditionalBlocks.length}`,
          type: 'else',
          condition: undefined,
          content: '',
          speaker: undefined
        };
        blockContent = [];
        blockSpeaker = '';
      } else if (trimmed.startsWith('<<endif')) {
        // End of conditional block
        if (currentBlock) {
          currentBlock.content = blockContent.join('\n').trim();
          currentBlock.speaker = blockSpeaker || undefined;
          conditionalBlocks.push(currentBlock);
        }
        inConditionalBlock = false;
        currentBlock = null;
        blockContent = [];
        blockSpeaker = '';
      } else if (inConditionalBlock) {
        // Content within conditional block
        if (trimmed.includes(':') && !trimmed.startsWith('<<')) {
          const [spk, ...rest] = trimmed.split(':');
          blockSpeaker = spk.trim();
          blockContent.push(rest.join(':').trim());
        } else if (!trimmed.startsWith('<<')) {
          blockContent.push(trimmed);
        }
      } else if (trimmed.includes(':') && !trimmed.startsWith('<<')) {
        const [spk, ...rest] = trimmed.split(':');
        speaker = spk.trim();
        dialogueContent += rest.join(':').trim() + '\n';
      } else if (!trimmed.startsWith('<<')) {
        dialogueContent += trimmed + '\n';
      }
    });
    
    nodes[nodeId] = {
      id: nodeId,
      type: choices.length > 0 ? 'player' : 'npc',
      speaker: speaker || undefined,
      content: dialogueContent.trim(),
      choices: choices.length > 0 ? choices : undefined,
      nextNodeId: nextNodeId || undefined,
      setFlags: setFlags.length > 0 ? setFlags : undefined,
      conditionalBlocks: conditionalBlocks.length > 0 ? conditionalBlocks : undefined,
      x: (idx % 3) * 250,
      y: y + Math.floor(idx / 3) * 180
    };
  });
  
  const startNodeId = Object.keys(nodes)[0] || 'start';
  
  return {
    id: 'imported',
    title,
    startNodeId,
    nodes
  };
}

