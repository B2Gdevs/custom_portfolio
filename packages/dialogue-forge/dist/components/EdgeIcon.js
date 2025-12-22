"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeIcon = EdgeIcon;
const react_1 = __importDefault(require("react"));
function EdgeIcon({ color = 'currentColor', size = 24, className = '' }) {
    return (react_1.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: className },
        react_1.default.createElement("circle", { cx: "6", cy: "12", r: "2", fill: color }),
        react_1.default.createElement("circle", { cx: "18", cy: "12", r: "2", fill: color }),
        react_1.default.createElement("line", { x1: "8", y1: "12", x2: "16", y2: "12", stroke: color, strokeWidth: "2" })));
}
