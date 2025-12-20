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
      if (node.speaker) {
        yarn += `${node.speaker}: ${node.content.replace(/\n/g, '\n' + node.speaker + ': ')}\n`;
      } else {
        yarn += `${node.content}\n`;
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
        // More flexible regex to handle various formats
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
        // Parse conditions - extract variable names for flag extraction
        // This is handled by extractVariablesFromYarn, but we still need to parse for dialogue structure
        const ifMatch = trimmed.match(/<<if\s+(?:not\s+)?\$(\w+)/);
        if (ifMatch && choices.length > 0) {
          // Add condition to last choice
          const lastChoice = choices[choices.length - 1];
          if (!lastChoice.conditions) {
            lastChoice.conditions = [];
          }
          lastChoice.conditions.push({
            flag: ifMatch[1],
            operator: trimmed.includes('not') ? 'is_not_set' : 'is_set'
          });
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

