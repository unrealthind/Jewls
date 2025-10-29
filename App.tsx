import React, { useState } from 'react';
import { KARAT_PURITY, TROY_OUNCE_IN_GRAMS } from './constants';
import type { CalculationResult } from './types';
import Input from './components/Input';
import Select from './components/Select';
import Button from './components/Button';
import ResultCard from './components/ResultCard';
import { GoldIcon } from './components/icons/GoldIcon';

type GoldPriceUnit = 'gram' | 'troy_ounce';

const App: React.FC = () => {
    const [manualGoldPrice, setManualGoldPrice] = useState<string>('');
    const [goldPriceUnit, setGoldPriceUnit] = useState<GoldPriceUnit>('gram');
    const [jewelryPrice, setJewelryPrice] = useState<string>('');
    const [jewelryWeight, setJewelryWeight] = useState<string>('');
    const [karat, setKarat] = useState<keyof typeof KARAT_PURITY>('22');
    const [results, setResults] = useState<CalculationResult | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const handleCalculate = () => {
        setFormError(null);
        setResults(null);
        
        const manualPrice = parseFloat(manualGoldPrice);
        const jPrice = parseFloat(jewelryPrice);
        const jWeight = parseFloat(jewelryWeight);

        if (isNaN(manualPrice) || isNaN(jPrice) || isNaN(jWeight) || manualPrice <= 0 || jPrice <= 0 || jWeight <= 0) {
            setFormError('Please enter valid, positive numbers for all fields.');
            return;
        }

        let goldPricePerGram = manualPrice;
        if (goldPriceUnit === 'troy_ounce') {
            goldPricePerGram = manualPrice / TROY_OUNCE_IN_GRAMS;
        }

        const purity = KARAT_PURITY[karat] / 100;
        const actualGoldValue = goldPricePerGram * jWeight * purity;

        if (jPrice < actualGoldValue) {
            setFormError('Jewelry price cannot be less than its raw gold value.');
            return;
        }
        
        const jewelryPricePerGram = jPrice / jWeight;
        const totalMarkup = jPrice - actualGoldValue;
        const markupPercentage = (totalMarkup / actualGoldValue) * 100;
        const goldPricePerGramOfJewelry = goldPricePerGram * purity;
        const markupPerGram = jewelryPricePerGram - goldPricePerGramOfJewelry;

        setResults({
            jewelryPricePerGram,
            markupPercentage,
            goldPricePerGramOfJewelry,
            markupPerGram,
            totalMarkup,
            totalGoldValue: actualGoldValue,
        });
    };

    const karatOptions = Object.keys(KARAT_PURITY).sort((a,b) => Number(b) - Number(a)).map(k => ({
        value: k,
        label: `${k}K`
    }));

    const isButtonDisabled = !manualGoldPrice || !jewelryPrice || !jewelryWeight;

    const unitButtonClasses = "relative inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium focus:z-10 focus:outline-none transition-colors duration-200";
    const activeUnitClasses = "bg-yellow-500 text-gray-900 border border-yellow-500";
    const inactiveUnitClasses = "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600";


    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-2xl shadow-yellow-500/10 overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <GoldIcon className="w-12 h-12 text-yellow-400" />
                        <div>
                            <h1 className="text-2xl font-bold text-yellow-400 tracking-wider">Gold Markup Calculator</h1>
                            <p className="text-gray-400">Calculate jewelry value in CAD</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                         <div>
                            <Input
                                label="Gold Price (24K CAD)"
                                type="number"
                                placeholder={goldPriceUnit === 'gram' ? "e.g., 101.55" : "e.g., 3158.50"}
                                value={manualGoldPrice}
                                onChange={(e) => setManualGoldPrice(e.target.value)}
                            />
                            <div className="mt-2 flex rounded-lg shadow-sm w-full" role="group">
                                <button
                                    type="button"
                                    onClick={() => setGoldPriceUnit('gram')}
                                    className={`${unitButtonClasses} rounded-l-lg ${goldPriceUnit === 'gram' ? activeUnitClasses : inactiveUnitClasses}`}
                                >
                                    per Gram
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGoldPriceUnit('troy_ounce')}
                                    className={`${unitButtonClasses} -ml-px rounded-r-lg ${goldPriceUnit === 'troy_ounce' ? activeUnitClasses : inactiveUnitClasses}`}
                                >
                                    per Troy Ounce
                                </button>
                            </div>
                        </div>
                        <Select
                            label="Jewelry Purity"
                            value={karat}
                            onChange={(e) => setKarat(e.target.value as keyof typeof KARAT_PURITY)}
                            options={karatOptions}
                        />
                        <Input
                            label="Jewelry Price (CAD)"
                            type="number"
                            placeholder="e.g., 1500"
                            value={jewelryPrice}
                            onChange={(e) => setJewelryPrice(e.target.value)}
                        />
                        <Input
                            label="Jewelry Weight (grams)"
                            type="number"
                            placeholder="e.g., 10"
                            value={jewelryWeight}
                            onChange={(e) => setJewelryWeight(e.target.value)}
                        />
                    </div>
                    
                    {formError && <p className="text-red-400 text-center mb-4 text-sm">{formError}</p>}

                    <Button onClick={handleCalculate} disabled={isButtonDisabled}>
                        Calculate Markup
                    </Button>
                </div>

                {results && (
                     <div className="bg-gray-900/50 p-6 border-t-2 border-yellow-400/20">
                        <h2 className="text-xl font-semibold text-center mb-6 text-yellow-300">Calculation Results</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
                            <ResultCard
                                label="Jewelry Price / Gram"
                                value={`$${results.jewelryPricePerGram.toFixed(2)}`}
                                description="Total price divided by weight"
                            />
                             <ResultCard
                                label="Gold Price / Gram"
                                value={`$${results.goldPricePerGramOfJewelry.toFixed(2)}`}
                                description={`Raw price of ${karat}K gold per gram`}
                            />
                            <ResultCard
                                label="Markup / Gram"
                                value={`$${results.markupPerGram.toFixed(2)}`}
                                description="Premium added per gram"
                            />
                            <ResultCard
                                label="Total Gold Value"
                                value={`$${results.totalGoldValue.toFixed(2)}`}
                                description="Total raw value of gold in the item"
                            />
                            <ResultCard
                                label="Total Markup"
                                value={`$${results.totalMarkup.toFixed(2)}`}
                                description="Premium over raw gold value"
                            />
                            <ResultCard
                                label="Markup Percentage"
                                value={`${results.markupPercentage.toFixed(2)}%`}
                                description="Markup as a % of gold value"
                            />
                        </div>
                    </div>
                )}
            </div>
            <footer className="text-center mt-8 text-gray-500 text-sm">
                <p>All prices are in Canadian Dollars (CAD). Please provide the current market price for 24K gold.</p>
            </footer>
        </div>
    );
};

export default App;