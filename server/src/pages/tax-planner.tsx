import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type BusinessType =
    | "sole-proprietorship"
    | "single-member-llc"
    | "multi-member-llc"
    | "partnership"
    | "s-corp"
    | "c-corp";

const businessOptions: { value: BusinessType; label: string }[] = [
    { value: "sole-proprietorship", label: "Sole Proprietorship" },
    { value: "single-member-llc", label: "1 Member LLC" },
    { value: "multi-member-llc", label: "2+ Member LLC" },
    { value: "partnership", label: "Partnership" },
    { value: "s-corp", label: "S-Corp" },
    { value: "c-corp", label: "C-Corp" },
];

function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(value);
}

function parseAmount(value: string) {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
}

function getBusinessTypeNote(type: BusinessType) {
    switch (type) {
        case "sole-proprietorship":
            return "A business owned by one person that is not legally incorporated.";
        case "single-member-llc":
            return "A business owned by one person that has legally incorporated as an LLC.";
        case "multi-member-llc":
            return "A business owned by two or more people that has legally incorporated as an LLC.";
        case "partnership":
            return "A business owned by two or more people that is not legally incorporated.";
        case "s-corp":
            return "A business that has recieved S-Corporation status from the IRS.";
        case "c-corp":
            return "A business that has legally been incorporated as a corporation.";
        default:
            return "";
    }
}

function getEstimatedTax(profit: number): number {
    const brackets: [number, number][] = [
        [11925, 0.10],
        [48475, 0.12],
        [103350, 0.22],
        [197300, 0.24],
        [250525, 0.32],
        [626350, 0.35],
        [Infinity, 0.37],
    ];

    let tax = 0;
    let prev = 0;

    for (const [limit, rate] of brackets) {
        const taxable = Math.min(profit, limit) - prev;
        if (taxable <= 0) break;

        tax += taxable * rate;
        prev = limit;
    }

    return Math.round(tax);
}

export default function TaxPlanner() {
    const [businessType, setBusinessType] = useState<BusinessType>("sole-proprietorship");
    const [isLoading, setIsLoading] = useState(true);

    const [estimatedReceipts, setEstimatedReceipts] = useState("");
    const [creditSales, setCreditSales] = useState("");
    const [returnsAllowances, setReturnsAllowances] = useState("");
    const [costOfGoodsSold, setCostOfGoodsSold] = useState("");
    const [estimatedExpenses, setEstimatedExpenses] = useState("");
    const [creditsDeductions, setCreditsDeductions] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
        setIsLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    const calculations = useMemo(() => {
        const receipts = parseAmount(estimatedReceipts);
        const sales = parseAmount(creditSales);
        const returns = parseAmount(returnsAllowances);
        const cogs = parseAmount(costOfGoodsSold);
        const expenses = parseAmount(estimatedExpenses);
        const credits = parseAmount(creditsDeductions);

        const grossIncome = receipts + sales - returns - cogs;
        const netProfitOrLoss = grossIncome - expenses;
        const taxableIncome = netProfitOrLoss - credits;

        let estimatedTax = 0;
        let taxMethod = "Progressive federal tax logic can be added later.";

        if (taxableIncome <= 0) {
        estimatedTax = 0;
        taxMethod = "No estimated tax because taxable income is at or below zero.";
        } else if (businessType === "c-corp") {
        estimatedTax = taxableIncome * 0.21;
        taxMethod = "Estimated using the flat 21% corporate rate.";
        } else {
        taxMethod =
            "Pass-through / owner-level estimated tax logic can be added later using 2025 brackets.";
        estimatedTax = getEstimatedTax(taxableIncome);
        }

        return {
        grossIncome,
        netProfitOrLoss,
        taxableIncome,
        estimatedTax,
        taxMethod,
        };
    }, [
        businessType,
        estimatedReceipts,
        creditSales,
        returnsAllowances,
        costOfGoodsSold,
        estimatedExpenses,
        creditsDeductions,
    ]);

    function handleAddToJournal() {
        const payload = {
        source: "tax-planner",
        businessType,
        provisionForIncomeTaxes: calculations.estimatedTax,
        prepaidIncomeTaxes: calculations.estimatedTax,
        createdAt: new Date().toISOString(),
        };

        localStorage.setItem("keepup-tax-planner-journal-draft", JSON.stringify(payload));
        window.alert("Tax Planner journal draft saved. You can now go to Journal.");
    }

    return (
        <section className="taxPlannerPage">
        <div className="taxPlannerHero">
            <div>
            <p className="taxPlannerEyebrow">Planning & estimates</p>
            <h1 className="pageTitle">Tax Planner</h1>
            <p className="muted taxPlannerIntro">Estimate taxable income for the year.</p>
            </div>

            <div className="taxPlannerActions">
            <Link to="/journal" className="btn">
                Go to Journal
            </Link>
            <button type="button" className="btn btnPrimary" onClick={handleAddToJournal}>
                Add to Journal
            </button>
            </div>
        </div>

        <div className="grid">
            {isLoading ? (
            <>
                <div className="card taxPlannerSpan12">
                <div className="row taxPlannerOverviewHeader">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-pill" />
                </div>

                <div className="taxPlannerOverviewGrid">
                    <div className="taxPlannerMiniCard">
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-value" />
                    <div className="skeleton skeleton-line long" />
                    <div className="skeleton skeleton-line medium" />
                    </div>

                    <div className="taxPlannerMiniCard">
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-value" />
                    <div className="skeleton skeleton-line long" />
                    <div className="skeleton skeleton-line medium" />
                    </div>

                    <div className="taxPlannerMiniCard">
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-value" />
                    <div className="skeleton skeleton-line long" />
                    <div className="skeleton skeleton-line medium" />
                    </div>
                </div>
                </div>

                <div className="card taxPlannerSpan4">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-line medium" />
                <div className="skeleton skeleton-input" />
                <div className="skeleton skeleton-line long" />
                <div className="skeleton skeleton-line medium" />

                <div className="taxPlannerInfoBox">
                    <div className="skeleton skeleton-line medium" />
                    <div className="skeleton skeleton-line long" />
                    <div className="skeleton skeleton-line long" />
                </div>
                </div>

                <div className="card taxPlannerSpan8">
                <div className="row">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-pill" />
                </div>

                <div className="taxPlannerLogicList">
                    <div className="skeleton skeleton-logic-row" />
                    <div className="skeleton skeleton-logic-row" />
                    <div className="skeleton skeleton-logic-row" />
                    <div className="skeleton skeleton-logic-row" />
                    <div className="skeleton skeleton-logic-row" />
                    <div className="skeleton skeleton-logic-row" />
                    <div className="skeleton skeleton-logic-row" />
                    <div className="skeleton skeleton-logic-row" />
                </div>
                </div>

                <div className="card taxPlannerSpan7">
                <div className="row">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-pill" />
                </div>

                <div className="skeleton skeleton-table-row" />
                <div className="skeleton skeleton-table-row" />
                <div className="skeleton skeleton-table-row" />
                <div className="skeleton skeleton-table-row" />
                <div className="skeleton skeleton-table-row" />
                <div className="skeleton skeleton-table-row" />
                </div>

                <div className="card taxPlannerSpan5">
                <div className="skeleton skeleton-title" />

                <div className="kpis taxPlannerKpis">
                    <div className="kpi">
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-value" />
                    </div>
                    <div className="kpi">
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-value" />
                    </div>
                    <div className="kpi">
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-value" />
                    </div>
                </div>

                <div className="taxPlannerSummaryBox">
                    <div className="skeleton skeleton-line medium" />
                    <div className="skeleton skeleton-line long" />
                    <div className="skeleton skeleton-line medium" />
                    <div className="skeleton skeleton-line long" />
                </div>

                <div className="taxPlannerJournalBox">
                    <div className="skeleton skeleton-line medium" />
                    <div className="skeleton skeleton-table-row" />
                    <div className="skeleton skeleton-table-row" />
                    <div className="skeleton skeleton-line medium" />
                </div>
                </div>
            </>
            ) : (
            <>
                <div className="card taxPlannerSpan12">
                <div className="row taxPlannerOverviewHeader">
                    <h2 className="cardTitle">Quick Overview</h2>
                    <span className="pill">Prototype UI</span>
                </div>

                <div className="taxPlannerOverviewGrid">
                    <div className="taxPlannerMiniCard">
                    <div className="taxPlannerMiniLabel">Business Type</div>
                    <div className="taxPlannerMiniValue">
                        {businessOptions.find((option) => option.value === businessType)?.label}
                    </div>
                    <p className="muted taxPlannerMiniText">{getBusinessTypeNote(businessType)}</p>
                    </div>

                    <div className="taxPlannerMiniCard">
                    <div className="taxPlannerMiniLabel">Estimated Taxable Income</div>
                    <div className="taxPlannerMiniValue">
                        {formatMoney(calculations.taxableIncome)}
                    </div>
                    <p className="muted taxPlannerMiniText">
                        Based on receipts, returns, COGS, expenses, and deductions entered below.
                    </p>
                    </div>

                    <div className="taxPlannerMiniCard">
                    <div className="taxPlannerMiniLabel">Estimated Tax</div>
                    <div className="taxPlannerMiniValue">{formatMoney(calculations.estimatedTax)}</div>
                    <p className="muted taxPlannerMiniText">{calculations.taxMethod}</p>
                    </div>
                </div>
                </div>

                <div className="card taxPlannerSpan4">
                <h2 className="cardTitle">Business Type</h2>

                <label htmlFor="business-type" className="taxPlannerLabel">
                    Choose what kind of business this is
                </label>

                <select
                    id="business-type"
                    className="input"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                >
                    {businessOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                    ))}
                </select>

                <p className="muted taxPlannerSmallNote">{getBusinessTypeNote(businessType)}</p>

                <div className="taxPlannerInfoBox">
                    <h3 className="taxPlannerSubheading">What this page does</h3>
                    <p className="muted">
                    This page is meant to estimate what the company may owe for the year so they can
                    plan finances ahead of time.
                    </p>
                </div>
                </div>

                <div className="card taxPlannerSpan8">
                <div className="row">
                    <h2 className="cardTitle" style={{ marginBottom: 0 }}>
                    Planning Logic
                    </h2>
                    <span className="pill">Calculation flow</span>
                </div>

                <div className="taxPlannerLogicList">
                    <div className="taxPlannerLogicRow">
                    <span>Add Estimated Receipts and Credit Sales</span>
                    </div>
                    <div className="taxPlannerLogicRow">
                    <span>Subtract Estimated Returns and Allowances</span>
                    </div>
                    <div className="taxPlannerLogicRow">
                    <span>Subtract Estimated Cost of Goods Sold</span>
                    </div>
                    <div className="taxPlannerLogicRow taxPlannerLogicResult">
                    <span>Equals Estimated Gross Income</span>
                    <strong>{formatMoney(calculations.grossIncome)}</strong>
                    </div>
                    <div className="taxPlannerLogicRow">
                    <span>Subtract Estimated Expenses</span>
                    </div>
                    <div className="taxPlannerLogicRow taxPlannerLogicResult">
                    <span>Equals Estimated Net Profit / Loss</span>
                    <strong>{formatMoney(calculations.netProfitOrLoss)}</strong>
                    </div>
                    <div className="taxPlannerLogicRow">
                    <span>Subtract Estimated Credits and Deductions</span>
                    </div>
                    <div className="taxPlannerLogicRow taxPlannerLogicResult">
                    <span>Equals Estimated Taxable Income</span>
                    <strong>{formatMoney(calculations.taxableIncome)}</strong>
                    </div>
                </div>
                </div>

                <div className="card taxPlannerSpan7">
                <div className="row">
                    <h2 className="cardTitle" style={{ marginBottom: 0 }}>
                    Input Table
                    </h2>
                    <span className="pill">Enter estimates</span>
                </div>

                <table className="table taxPlannerTable">
                    <thead>
                    <tr>
                        <th>Line Item</th>
                        <th>Estimated Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Estimated Receipts</td>
                        <td>
                        <input
                            className="input"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={estimatedReceipts}
                            onChange={(e) => setEstimatedReceipts(e.target.value)}
                        />
                        </td>
                    </tr>
                    <tr>
                        <td>Credit Sales</td>
                        <td>
                        <input
                            className="input"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={creditSales}
                            onChange={(e) => setCreditSales(e.target.value)}
                        />
                        </td>
                    </tr>
                    <tr>
                        <td>Estimated Returns &amp; Allowances</td>
                        <td>
                        <input
                            className="input"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={returnsAllowances}
                            onChange={(e) => setReturnsAllowances(e.target.value)}
                        />
                        </td>
                    </tr>
                    <tr>
                        <td>Estimated Cost of Goods Sold</td>
                        <td>
                        <input
                            className="input"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={costOfGoodsSold}
                            onChange={(e) => setCostOfGoodsSold(e.target.value)}
                        />
                        </td>
                    </tr>
                    <tr>
                        <td>Estimated Expenses</td>
                        <td>
                        <input
                            className="input"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={estimatedExpenses}
                            onChange={(e) => setEstimatedExpenses(e.target.value)}
                        />
                        </td>
                    </tr>
                    <tr>
                        <td>Estimated Credits &amp; Deductions</td>
                        <td>
                        <input
                            className="input"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={creditsDeductions}
                            onChange={(e) => setCreditsDeductions(e.target.value)}
                        />
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>

                <div className="card taxPlannerSpan5">
                <h2 className="cardTitle">Estimate Summary</h2>

                <div className="kpis taxPlannerKpis">
                    <div className="kpi">
                    <div className="kpiLabel">Gross Income</div>
                    <div className="kpiValue">{formatMoney(calculations.grossIncome)}</div>
                    </div>
                    <div className="kpi">
                    <div className="kpiLabel">Taxable Income</div>
                    <div className="kpiValue">{formatMoney(calculations.taxableIncome)}</div>
                    </div>
                    <div className="kpi">
                    <div className="kpiLabel">Estimated Tax</div>
                    <div className="kpiValue">{formatMoney(calculations.estimatedTax)}</div>
                    </div>
                </div>

                <div className="taxPlannerSummaryBox">
                    <div className="taxPlannerSummaryRow">
                    <span>Selected business type</span>
                    <strong>
                        {businessOptions.find((option) => option.value === businessType)?.label}
                    </strong>
                    </div>

                    <div className="taxPlannerSummaryRow">
                    <span>Tax treatment note</span>
                    <strong className="taxPlannerSummaryStrong">{calculations.taxMethod}</strong>
                    </div>
                </div>

                <div className="taxPlannerJournalBox">
                    <h3 className="taxPlannerSubheading">Journal Entry Preview</h3>
                    <table className="table">
                    <thead>
                        <tr>
                        <th>Account</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>Provision for Income Taxes</td>
                        <td>{formatMoney(calculations.estimatedTax)}</td>
                        <td>—</td>
                        </tr>
                        <tr>
                        <td>Prepaid Income Taxes</td>
                        <td>—</td>
                        <td>{formatMoney(calculations.estimatedTax)}</td>
                        </tr>
                    </tbody>
                    </table>

                    <p className="muted taxPlannerSmallNote">
                    This is just a front-end planning estimate for now.
                    </p>
                </div>
                </div>
            </>
            )}
        </div>
        </section>
    );
}