"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ value }: { value: number }) {
    return (
        <div className="relative h-[1em] w-[0.6em] overflow-hidden inline-block align-bottom">
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: -value * 10 + "%" }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                className="absolute top-0 left-0 w-full flex flex-col items-center"
            >
                {NUMBERS.map((num) => (
                    <span key={num} className="h-[1em] flex items-center justify-center bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                        {num}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

export function SlotCounter({ value }: { value: number }) {
    // Format to 2 decimal places fixed string, e.g. "123000.50"
    const formatted = value.toFixed(2);
    const [whole, decimal] = formatted.split(".");

    // Split whole part into array of digits/commas
    // Actually, animating commas is tricky if we want pure slot effect.
    // Let's just animate the DIGITS.
    // We need to render "1,234.56" but animate the numbers.

    // Easier approach for "Slot Machine": 
    // Render the formatted string. For each character:
    // If it's a digit -> Render <Digit />
    // If not (comma, dot) -> Render as is.

    const wholeWithCommas = parseInt(whole).toLocaleString();
    const fullString = `${wholeWithCommas}.${decimal}`;

    return (
        <span className="inline-flex items-baseline font-mono tracking-tighter">
            {fullString.split("").map((char, index) => {
                if (/[0-9]/.test(char)) {
                    return <Digit key={`${index}-${char}`} value={parseInt(char)} />;
                }
                return <span key={index} className="inline-block bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">{char}</span>;
            })}
        </span>
    );
}
