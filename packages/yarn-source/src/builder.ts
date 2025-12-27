/**
 * Fluent builder for Yarn source generation
 * 
 * Provides a programmatic way to construct Yarn source
 * with proper syntax and validation.
 */

export class YarnSourceBuilder {
  private nodes: Map<string, NodeBuilder> = new Map();
  private currentNode: NodeBuilder | null = null;
  
  /**
   * Start a new node
   */
  node(id: string): NodeBuilder {
    const node = new NodeBuilder(id, this);
    this.nodes.set(id, node);
    this.currentNode = node;
    return node;
  }
  
  /**
   * Build the complete Yarn source
   */
  build(): string {
    const lines: string[] = [];
    
    for (const node of this.nodes.values()) {
      lines.push(...node.build());
      lines.push('');
    }
    
    return lines.join('\n');
  }
}

export class NodeBuilder {
  private lines: string[] = [];
  private inCondition = false;
  private conditionDepth = 0;
  
  constructor(
    public readonly id: string,
    private parent: YarnSourceBuilder
  ) {}
  
  /**
   * Add dialogue line
   */
  line(speaker: string, text: string, lineId?: string): this {
    const tag = lineId ? ` #line:${lineId}` : '';
    this.lines.push(`${speaker}: ${text}${tag}`);
    return this;
  }
  
  /**
   * Add a choice
   */
  choice(text: string, lineId?: string): ChoiceBuilder {
    return new ChoiceBuilder(this, text, lineId);
  }
  
  /**
   * Start an if block
   */
  if(condition: string): this {
    this.lines.push(`<<if ${condition}>>`);
    this.inCondition = true;
    this.conditionDepth++;
    return this;
  }
  
  /**
   * Add an elseif block
   */
  elseif(condition: string): this {
    this.lines.push(`<<elseif ${condition}>>`);
    return this;
  }
  
  /**
   * Add an else block
   */
  else(): this {
    this.lines.push('<<else>>');
    return this;
  }
  
  /**
   * End the current if block
   */
  endif(): this {
    this.lines.push('<<endif>>');
    this.conditionDepth--;
    if (this.conditionDepth === 0) {
      this.inCondition = false;
    }
    return this;
  }
  
  /**
   * Set a variable
   */
  set(variable: string, value: any): this {
    const formattedValue = typeof value === 'string' ? `"${value}"` : String(value);
    this.lines.push(`<<set $${variable} = ${formattedValue}>>`);
    return this;
  }
  
  /**
   * Jump to another node
   */
  jump(nodeId: string): this {
    this.lines.push(`<<jump ${nodeId}>>`);
    return this;
  }
  
  /**
   * Execute a command
   */
  command(cmd: string): this {
    this.lines.push(`<<${cmd}>>`);
    return this;
  }
  
  /**
   * Add raw line
   */
  raw(line: string): this {
    this.lines.push(line);
    return this;
  }
  
  /**
   * End this node and start a new one
   */
  node(id: string): NodeBuilder {
    return this.parent.node(id);
  }
  
  /**
   * Finish building and return parent
   */
  done(): YarnSourceBuilder {
    return this.parent;
  }
  
  /**
   * Build this node's lines
   */
  build(): string[] {
    return [
      `title: ${this.id}`,
      '---',
      ...this.lines,
      '===',
    ];
  }
  
  /** @internal Add a line from child builders */
  _addLine(line: string): void {
    this.lines.push(line);
  }
}

export class ChoiceBuilder {
  private setFlags: string[] = [];
  private jumpTo: string | null = null;
  
  constructor(
    private parent: NodeBuilder,
    private text: string,
    private lineId?: string
  ) {}
  
  /**
   * Set a flag when this choice is selected
   */
  set(flag: string): this {
    this.setFlags.push(flag);
    return this;
  }
  
  /**
   * Jump to a node when this choice is selected
   */
  jump(nodeId: string): this {
    this.jumpTo = nodeId;
    return this;
  }
  
  /**
   * Finish this choice and add another
   */
  choice(text: string, lineId?: string): ChoiceBuilder {
    this.finalize();
    return new ChoiceBuilder(this.parent, text, lineId);
  }
  
  /**
   * Finish choices and return to node
   */
  end(): NodeBuilder {
    this.finalize();
    return this.parent;
  }
  
  private finalize(): void {
    const tag = this.lineId ? ` #line:${this.lineId}` : '';
    this.parent._addLine(`-> ${this.text}${tag}`);
    
    for (const flag of this.setFlags) {
      this.parent._addLine(`    <<set $${flag} = true>>`);
    }
    
    if (this.jumpTo) {
      this.parent._addLine(`    <<jump ${this.jumpTo}>>`);
    }
  }
}

