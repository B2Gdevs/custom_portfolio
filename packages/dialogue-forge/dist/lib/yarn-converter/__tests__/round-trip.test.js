"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const yarn_converter_1 = require("../../yarn-converter");
/**
 * Test round-trip conversion: Yarn → DialogueTree → Yarn
 * This ensures we can import and export without data loss
 */
(0, vitest_1.describe)('Yarn Round-Trip Conversion', () => {
    const testCases = [
        {
            name: 'Basic dialogue with choices',
            yarn: `title: start
---
NPC: Hello! How can I help you?
-> Option 1
    <<jump option1>>
-> Option 2
    <<jump option2>>
===

title: option1
---
NPC: You chose option 1!
===

title: option2
---
NPC: You chose option 2!
===
`
        },
        {
            name: 'Dialogue with flags',
            yarn: `title: start
---
NPC: Welcome!
<<set $flag1 = true>>
<<set $flag2 = true>>
-> Continue
    <<set $flag3 = true>>
    <<jump next>>
===

title: next
---
NPC: Flags have been set!
===
`
        },
        {
            name: 'Conditional blocks',
            yarn: `title: start
---
<<if $has_key>>
    Guard: The door is unlocked.
<<else>>
    Guard: The door is locked.
<<endif>>
===
`
        },
        {
            name: 'Variable operations',
            yarn: `title: merchant
---
Merchant: You have {$stat_gold} gold.
<<set $stat_gold += 100>>
Merchant: Now you have {$stat_gold} gold!
-> Buy item
    <<set $stat_gold -= 50>>
    <<set $item_sword = true>>
    Merchant: You bought a sword! You have {$stat_gold} gold left.
    <<jump end>>
===

title: end
---
===
`
        },
        {
            name: 'Complex conditional with multiple blocks',
            yarn: `title: start
---
<<if $stat_gold >= 100>>
    Merchant: You can afford the sword!
<<elseif $stat_gold >= 50>>
    Merchant: You can afford the potion!
<<else>>
    Merchant: You don't have enough gold.
<<endif>>
===
`
        }
    ];
    testCases.forEach(({ name, yarn }) => {
        (0, vitest_1.it)(`should round-trip: ${name}`, () => {
            // Import Yarn to DialogueTree
            const dialogue = (0, yarn_converter_1.importFromYarn)(yarn, 'Test Dialogue');
            // Export DialogueTree back to Yarn
            const exportedYarn = (0, yarn_converter_1.exportToYarn)(dialogue);
            // Import the exported Yarn again
            const reimportedDialogue = (0, yarn_converter_1.importFromYarn)(exportedYarn, 'Test Dialogue');
            // Verify structure is preserved
            (0, vitest_1.expect)(reimportedDialogue.nodes).toBeDefined();
            (0, vitest_1.expect)(Object.keys(reimportedDialogue.nodes).length).toBeGreaterThan(0);
            // Verify all nodes are present
            const originalNodeIds = Object.keys(dialogue.nodes);
            const reimportedNodeIds = Object.keys(reimportedDialogue.nodes);
            (0, vitest_1.expect)(reimportedNodeIds.length).toBe(originalNodeIds.length);
            // Verify node types are preserved
            originalNodeIds.forEach(nodeId => {
                const original = dialogue.nodes[nodeId];
                const reimported = reimportedDialogue.nodes[nodeId];
                (0, vitest_1.expect)(reimported).toBeDefined();
                (0, vitest_1.expect)(reimported.type).toBe(original.type);
            });
        });
    });
    (0, vitest_1.it)('should preserve variable operations', () => {
        const yarn = `title: test
---
NPC: Test
<<set $stat_gold += 100>>
<<set $stat_gold -= 50>>
<<set $stat_strength *= 2>>
===
`;
        const dialogue = (0, yarn_converter_1.importFromYarn)(yarn, 'Test');
        const exported = (0, yarn_converter_1.exportToYarn)(dialogue);
        // Verify operations are in exported Yarn
        (0, vitest_1.expect)(exported).toContain('<<set $stat_gold += 100>>');
        (0, vitest_1.expect)(exported).toContain('<<set $stat_gold -= 50>>');
        (0, vitest_1.expect)(exported).toContain('<<set $stat_strength *= 2>>');
    });
    (0, vitest_1.it)('should preserve variable interpolation', () => {
        const yarn = `title: test
---
NPC: Hello {$player_name}! You have {$stat_gold} gold.
===
`;
        const dialogue = (0, yarn_converter_1.importFromYarn)(yarn, 'Test');
        const exported = (0, yarn_converter_1.exportToYarn)(dialogue);
        // Variable interpolation should be preserved in content
        (0, vitest_1.expect)(dialogue.nodes.test.content).toContain('{$player_name}');
        (0, vitest_1.expect)(dialogue.nodes.test.content).toContain('{$stat_gold}');
    });
    (0, vitest_1.it)('should preserve conditional choices', () => {
        const yarn = `title: start
---
<<if $has_key>>
    -> Use key
        <<jump unlocked>>
<<endif>>
-> Try to force
    <<jump forced>>
===
`;
        const dialogue = (0, yarn_converter_1.importFromYarn)(yarn, 'Test');
        const exported = (0, yarn_converter_1.exportToYarn)(dialogue);
        // Verify conditional choice structure
        const playerNode = dialogue.nodes.start;
        (0, vitest_1.expect)(playerNode.type).toBe('player');
        (0, vitest_1.expect)(playerNode.choices).toBeDefined();
        (0, vitest_1.expect)(playerNode.choices.length).toBeGreaterThan(0);
        // Verify conditions are exported
        (0, vitest_1.expect)(exported).toContain('<<if');
        (0, vitest_1.expect)(exported).toContain('<<endif>>');
    });
});
