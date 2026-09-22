import {
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  Activity,
  Building2,
  CircleDollarSign,
  Clock3,
  Landmark,
  MapPin,
  Network,
  ShieldAlert,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";

import type {
  Account,
  PredictedLocation,
  Transaction,
} from "../../data/cases.mock";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

interface MoneyFlowGraphProps {
  accounts: Account[];
  transactions: Transaction[];
  predictedLocations: PredictedLocation[];
}

type EntityType =
  | "victim"
  | "mule"
  | "beneficiary"
  | "cashout"
  | "pattern"
  | "related-case";

interface InvestigationNodeData {
  label: string;
  subtitle: string;
  entityType: EntityType;
  risk?: "Low" | "Medium" | "High" | "Critical";
  confidence?: number;
  patternMatch?: number;
  caseId?: string;
  patternId?: string;
}

type InvestigationNode = Node<
  InvestigationNodeData,
  "investigation"
>;

interface SelectedEntity {
  node: InvestigationNode;
}

interface ExpandedState {
  mule: boolean;
  cashout: boolean;
  selectedPatternId: string | null;
}

/* ========================================================================== */
/* MOCK INTELLIGENCE                                                          */
/* ========================================================================== */

const cityPatterns = [
  {
    id: "PAT-07",
    label: "Rapid transfer → ATM cash-out",
    match: 87,
    cases: 6,
    areas: ["Jasola", "Okhla"],
  },
  {
    id: "PAT-12",
    label: "Mule → beneficiary split",
    match: 74,
    cases: 4,
    areas: ["Kalkaji", "Jasola"],
  },
];

const relatedCases = [
  {
    id: "CC-1032",
    type: "UPI Fraud",
    amount: 96000,
    area: "Okhla",
    date: "22 Sep",
    similarity: 89,
  },
  {
    id: "CC-1038",
    type: "Phishing",
    amount: 42000,
    area: "Kalkaji",
    date: "21 Sep",
    similarity: 76,
  },
  {
    id: "CC-1029",
    type: "Investment Scam",
    amount: 120000,
    area: "Jasola",
    date: "20 Sep",
    similarity: 84,
  },
];

/* ========================================================================== */
/* INVESTIGATION NODE                                                         */
/* ========================================================================== */

function InvestigationNode({
  data,
}: NodeProps<InvestigationNode>) {
  const icon =
    data.entityType === "victim"
      ? <UserRound size={16} />
      : data.entityType === "mule"
        ? <ShieldAlert size={16} />
        : data.entityType === "beneficiary"
          ? <Landmark size={16} />
          : data.entityType === "cashout"
            ? <MapPin size={16} />
            : data.entityType === "pattern"
              ? <Network size={16} />
              : <ShieldAlert size={16} />;

  const iconClass =
    data.entityType === "mule"
      ? "bg-red-50 text-red-600"
      : data.entityType === "cashout"
        ? "bg-teal-50 text-teal-600"
        : data.entityType === "pattern"
          ? "bg-blue-50 text-blue-600"
          : data.entityType === "related-case"
            ? "bg-indigo-50 text-indigo-600"
            : "bg-slate-100 text-slate-600";

  const borderClass =
    data.entityType === "mule"
      ? "border-red-200"
      : data.entityType === "cashout"
        ? "border-teal-200"
        : data.entityType === "pattern"
          ? "border-blue-200"
          : "border-slate-200";

  return (
    <div
      className={[
        "relative min-w-[185px] overflow-visible rounded-xl border bg-white",
        "shadow-[0_3px_12px_rgba(15,23,42,0.055)]",
        borderClass,
      ].join(" ")}
    >
      {/* Horizontal handles */}
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-2 !border-white !bg-slate-300"
      />

      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-2 !border-white !bg-slate-300"
      />

      {/* Vertical handles */}
      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-2 !border-white !bg-slate-300"
      />

      <Handle
        id="source-top"
        type="source"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-2 !border-white !bg-slate-300"
      />

      <Handle
        id="target-bottom"
        type="target"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-2 !border-white !bg-slate-300"
      />

      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-2 !border-white !bg-slate-300"
      />

      <div className="flex items-center gap-3 px-3.5 py-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold leading-4 text-slate-800">
            {data.label}
          </p>

          <p className="mt-1 truncate text-[10px] leading-3 text-slate-400">
            {data.subtitle}
          </p>
        </div>
      </div>

      {data.risk && (
        <div className="border-t border-slate-100 px-3.5 py-1.5">
          <RiskIndicator risk={data.risk} />
        </div>
      )}

      {data.confidence !== undefined && (
        <div className="border-t border-slate-100 px-3.5 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400">
              Prediction confidence
            </span>

            <span className="text-[10px] font-semibold text-teal-600">
              {data.confidence}%
            </span>
          </div>
        </div>
      )}

      {data.patternMatch !== undefined && (
        <div className="border-t border-slate-100 px-3.5 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400">
              Similarity
            </span>

            <span className="text-[10px] font-semibold text-blue-600">
              {data.patternMatch}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  investigation: InvestigationNode,
};

/* ========================================================================== */
/* GRAPH CANVAS                                                               */
/* ========================================================================== */

function GraphCanvas({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
  onPaneClick,
}: {
  nodes: InvestigationNode[];
  edges: Edge[];
  selectedNodeId?: string;
  onNodeClick: (node: InvestigationNode) => void;
  onPaneClick: () => void;
}) {
  const { fitView } = useReactFlow();

  return (
    <div className="relative h-[430px] overflow-hidden rounded-xl border border-slate-200 bg-[#f9fbfc]">
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.20]">
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
        >
          <defs>
            <pattern
              id="trace-grid"
              width="36"
              height="36"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 36 0 L 0 0 0 36"
                fill="none"
                stroke="#d8e4e8"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#trace-grid)"
          />
        </svg>
      </div>

      {/* Graph label */}
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />

          <span className="text-[10px] font-semibold text-slate-600">
            INVESTIGATION FLOW
          </span>
        </div>
      </div>

      {/* Recenter */}
      <button
        type="button"
        onClick={() =>
          fitView({
            padding: 0.22,
            duration: 350,
          })
        }
        className="absolute right-4 top-4 z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
      >
        Recenter
      </button>

      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          selected: node.id === selectedNodeId,
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.22,
        }}
        minZoom={0.55}
        maxZoom={1.25}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        zoomOnPinch
        panOnDrag
        panOnScroll={false}
        onNodeClick={(_, node) =>
          onNodeClick(node as InvestigationNode)
        }
        onPaneClick={onPaneClick}
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!bottom-4 !right-4 !overflow-hidden !rounded-lg !border !border-slate-200 !bg-white !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}

/* ========================================================================== */
/* MAIN COMPONENT                                                             */
/* ========================================================================== */

export default function MoneyFlowGraph({
  accounts,
  transactions,
  predictedLocations,
}: MoneyFlowGraphProps) {
  const victim = accounts.find(
    (account) => account.type === "Victim",
  );

  const mule = accounts.find(
    (account) => account.type === "Suspected Mule",
  );

  const beneficiary = accounts.find(
    (account) => account.type === "Beneficiary",
  );

  const cashout = predictedLocations[0];

  const [expanded, setExpanded] =
    useState<ExpandedState>({
      mule: false,
      cashout: false,
      selectedPatternId: null,
    });

  const [selected, setSelected] =
    useState<SelectedEntity | null>(null);

  /* ======================================================================== */
  /* NODES                                                                    */
  /* ======================================================================== */

  const nodes = useMemo<InvestigationNode[]>(() => {
    const result: InvestigationNode[] = [];

    /*
     * MAIN FLOW
     *
     * All three are on exactly the same Y coordinate.
     *
     * Victim ───────── Mule ───────── Cash-out
     */

    if (victim) {
      result.push({
        id: "victim",
        type: "investigation",
        position: {
          x: 40,
          y: 185,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: victim.holderLabel,
          subtitle: "Victim account",
          entityType: "victim",
        },
      });
    }

    if (mule) {
      result.push({
        id: "mule",
        type: "investigation",
        position: {
          x: 345,
          y: 185,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: mule.holderLabel,
          subtitle: "Suspected mule",
          entityType: "mule",
          risk: mule.riskLevel,
        },
      });
    }

    if (cashout) {
      result.push({
        id: "cashout",
        type: "investigation",
        position: {
          x: 650,
          y: 185,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: cashout.name,
          subtitle: `${cashout.type} · ${cashout.area}`,
          entityType: "cashout",
          confidence: cashout.confidence,
        },
      });
    }

    /*
     * BENEFICIARY
     *
     * Exactly above mule.
     */
    if (expanded.mule && beneficiary) {
      result.push({
        id: "beneficiary",
        type: "investigation",
        position: {
          x: 345,
          y: 35,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Bottom,
        data: {
          label: beneficiary.holderLabel,
          subtitle: "Beneficiary account",
          entityType: "beneficiary",
        },
      });
    }

    /*
     * PATTERNS
     *
     * Exactly above/below cash-out.
     */
    if (expanded.cashout) {
      cityPatterns.forEach((pattern, index) => {
        result.push({
          id: `pattern-${pattern.id}`,
          type: "investigation",
          position: {
            x: 650,
            y: index === 0 ? 35 : 325,
          },
          sourcePosition: Position.Right,
          targetPosition:
            index === 0
              ? Position.Bottom
              : Position.Top,
          data: {
            label: pattern.label,
            subtitle: `${pattern.cases} similar cases · ${pattern.areas.join(
              " / ",
            )}`,
            entityType: "pattern",
            patternMatch: pattern.match,
            patternId: pattern.id,
          },
        });
      });
    }

    /*
     * RELATED CASES
     *
     * Horizontally aligned with the selected pattern.
     */
    if (expanded.selectedPatternId) {
      relatedCases.forEach((item, index) => {
        result.push({
          id: `case-${item.id}`,
          type: "investigation",
          position: {
            x: 955,
            y:
              index === 0
                ? 35
                : index === 1
                  ? 180
                  : 325,
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: {
            label: item.id,
            subtitle: `${item.type} · ${item.area}`,
            entityType: "related-case",
            caseId: item.id,
            patternMatch: item.similarity,
          },
        });
      });
    }

    return result;
  }, [
    victim,
    mule,
    beneficiary,
    cashout,
    expanded,
  ]);

  /* ======================================================================== */
  /* EDGES                                                                    */
  /* ======================================================================== */

  const edges = useMemo<Edge[]>(() => {
    const result: Edge[] = [];

    const victimToMule = transactions.find(
      (transaction) =>
        transaction.fromAccount === victim?.id &&
        transaction.toAccount === mule?.id,
    );

    const muleToBeneficiary = transactions.find(
      (transaction) =>
        transaction.fromAccount === mule?.id &&
        transaction.toAccount === beneficiary?.id,
    );

    const withdrawal = transactions.find(
      (transaction) =>
        transaction.type === "Cash Withdrawal",
    );

    /*
     * ======================================================================
     * MAIN MONEY FLOW
     * ======================================================================
     *
     * STRAIGHT ONLY.
     *
     * No curves.
     * No step.
     * No smoothstep.
     */

    if (victim && mule) {
      result.push(
        createStraightEdge({
          id: "victim-mule",
          source: "victim",
          target: "mule",
          sourceHandle: "source-right",
          targetHandle: "target-left",
          color: "#64748b",
          dashed: !victimToMule,
          animated: Boolean(victimToMule),
        }),
      );
    }

    if (mule && cashout) {
      result.push(
        createStraightEdge({
          id: "mule-cashout",
          source: "mule",
          target: "cashout",
          sourceHandle: "source-right",
          targetHandle: "target-left",
          color: "#14b8a6",
          dashed: !withdrawal,
          animated: Boolean(withdrawal),
        }),
      );
    }

    /*
     * ======================================================================
     * MULE → BENEFICIARY
     * ======================================================================
     *
     * They are vertically aligned.
     *
     * Therefore this is a completely straight vertical arrow.
     */

    if (
      expanded.mule &&
      beneficiary &&
      mule
    ) {
      result.push(
        createStraightEdge({
          id: "mule-beneficiary",
          source: "mule",
          target: "beneficiary",
          sourceHandle: "source-top",
          targetHandle: "target-bottom",
          color: "#64748b",
          dashed: !muleToBeneficiary,
        }),
      );
    }

    /*
     * ======================================================================
     * CASHOUT → PATTERNS
     * ======================================================================
     *
     * Also vertically aligned.
     *
     * No bends.
     */

    if (expanded.cashout) {
      cityPatterns.forEach((pattern, index) => {
        const topPattern = index === 0;

        result.push(
          createStraightEdge({
            id: `cashout-${pattern.id}`,
            source: "cashout",
            target: `pattern-${pattern.id}`,
            sourceHandle: topPattern
              ? "source-top"
              : "source-bottom",
            targetHandle: topPattern
              ? "target-bottom"
              : "target-top",
            color: "#4f8fbe",
          }),
        );
      });
    }

    /*
     * ======================================================================
     * PATTERN → RELATED CASES
     * ======================================================================
     *
     * Horizontal relationship.
     *
     * Pattern ─────────► Case
     *
     * Again: completely straight.
     */

    if (expanded.selectedPatternId) {
      relatedCases.forEach((item) => {
        result.push(
          createStraightEdge({
            id: `pattern-case-${item.id}`,
            source: `pattern-${expanded.selectedPatternId}`,
            target: `case-${item.id}`,
            sourceHandle: "source-right",
            targetHandle: "target-left",
            color: "#8aaec8",
            dashed: true,
          }),
        );
      });
    }

    return result;
  }, [
    transactions,
    victim,
    mule,
    beneficiary,
    cashout,
    expanded,
  ]);

  /* ======================================================================== */
  /* CLICK BEHAVIOUR                                                          */
  /* ======================================================================== */

  const handleNodeClick = (
    node: InvestigationNode,
  ) => {
    setSelected({
      node,
    });

    switch (node.data.entityType) {
      case "mule":
        setExpanded((current) => ({
          ...current,
          mule: !current.mule,
        }));
        break;

      case "cashout":
        setExpanded((current) => ({
          ...current,
          cashout: !current.cashout,
        }));
        break;

      case "pattern":
        setExpanded((current) => ({
          ...current,
          cashout: true,
          selectedPatternId:
            current.selectedPatternId ===
            node.data.patternId
              ? null
              : node.data.patternId ?? null,
        }));
        break;

      default:
        break;
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Network
                size={17}
                className="text-blue-600"
              />

              <h2 className="text-[14px] font-semibold text-slate-900">
                Money Flow Investigation
              </h2>
            </div>

           
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <Legend
              dot="bg-slate-500"
              label="Money flow"
            />

            <Legend
              dot="bg-blue-500"
              label="Pattern"
            />

            <Legend
              dot="bg-teal-500"
              label="Prediction"
            />

            <Legend
              dot="bg-red-500"
              label="Risk"
            />
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* GRAPH + RIGHT PANEL                                                */}
      {/* ================================================================== */}

      <div className="grid min-h-0 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 p-3.5">
          <ReactFlowProvider>
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              selectedNodeId={
                selected?.node.id
              }
              onNodeClick={handleNodeClick}
              onPaneClick={() =>
                setSelected(null)
              }
            />
          </ReactFlowProvider>

          <div className="mt-2 px-1 text-[10px] leading-4 text-slate-400">
            <span className="font-medium text-slate-500">
              Mule
            </span>{" "}
            → beneficiary ·{" "}
            <span className="font-medium text-slate-500">
              Cash-out
            </span>{" "}
            → patterns ·{" "}
            <span className="font-medium text-slate-500">
              Pattern
            </span>{" "}
            → related cases
          </div>
        </div>

        <InvestigationPanel
          selection={selected}
          accounts={accounts}
          transactions={transactions}
          predictedLocations={
            predictedLocations
          }
          onClose={() =>
            setSelected(null)
          }
        />
      </div>
    </section>
  );
}

/* ========================================================================== */
/* RIGHT PANEL                                                                */
/* ========================================================================== */

function InvestigationPanel({
  selection,
  accounts,
  transactions,
  predictedLocations,
  onClose,
}: {
  selection: SelectedEntity | null;
  accounts: Account[];
  transactions: Transaction[];
  predictedLocations: PredictedLocation[];
  onClose: () => void;
}) {
  if (!selection) {
    return (
      <aside className="min-h-0 border-t border-slate-100 bg-[#f8fbfc] lg:h-[430px] lg:border-l lg:border-t-0">
        <div className="flex h-full items-center justify-center overflow-y-auto px-7">
          <div className="max-w-[260px] text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity size={18} />
            </div>

            <p className="mt-4 text-[13px] font-semibold text-slate-800">
              Investigation brief
            </p>

            <p className="mt-2 text-[11px] leading-5 text-slate-400">
              Select a node to understand what it represents,
              why it matters, and what it connects to.
            </p>

            <div className="mt-5 space-y-2 text-left">
              <PanelHint
                label="Mule"
                text="Account risk and connected activity."
              />

              <PanelHint
                label="Cash-out"
                text="Location confidence and withdrawal timing."
              />

              <PanelHint
                label="Pattern"
                text="Similar activity and related cases."
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const data = selection.node.data;

  return (
    <aside className="min-h-0 border-t border-slate-100 bg-[#f8fbfc] lg:h-[430px] lg:border-l lg:border-t-0">
      {/* Panel header */}
      <div className="flex items-start justify-between border-b border-slate-200 bg-white px-5 py-3.5">
        <div className="min-w-0 pr-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-600">
            Investigation brief
          </p>

          <h3 className="mt-1.5 truncate text-[15px] font-semibold leading-5 text-slate-900">
            {data.label}
          </h3>

         
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={15} />
        </button>
      </div>

      {/* Scrollable panel body */}
      <div className="h-[calc(430px-78px)] overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          {data.entityType === "victim" && (
            <AccountDetails
              account={accounts.find(
                (item) =>
                  item.type === "Victim",
              )}
              transactions={transactions}
            />
          )}

          {data.entityType === "mule" && (
            <AccountDetails
              account={accounts.find(
                (item) =>
                  item.type === "Suspected Mule",
              )}
              transactions={transactions}
            />
          )}

          {data.entityType === "beneficiary" && (
            <AccountDetails
              account={accounts.find(
                (item) =>
                  item.type === "Beneficiary",
              )}
              transactions={transactions}
            />
          )}

          {data.entityType === "cashout" &&
            predictedLocations[0] && (
              <CashoutDetails
                location={
                  predictedLocations[0]
                }
              />
            )}

          {data.entityType === "pattern" && (
            <PatternDetails
              pattern={
                cityPatterns.find(
                  (item) =>
                    item.id ===
                    data.patternId,
                ) ??
                cityPatterns[0]
              }
            />
          )}

          {data.entityType === "related-case" && (
            <RelatedCaseDetails
              caseData={
                relatedCases.find(
                  (item) =>
                    item.id === data.caseId,
                ) ??
                relatedCases[0]
              }
            />
          )}
        </div>
      </div>
    </aside>
  );
}

/* ========================================================================== */
/* ACCOUNT DETAILS                                                            */
/* ========================================================================== */

function AccountDetails({
  account,
  transactions,
}: {
  account?: Account;
  transactions: Transaction[];
}) {
  if (!account) return null;

  const connected = transactions.filter(
    (transaction) =>
      transaction.fromAccount === account.id ||
      transaction.toAccount === account.id,
  );

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <WalletCards size={16} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-800">
              {account.holderLabel}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {account.type}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <InfoRow
            icon={<Building2 size={13} />}
            label="Bank"
            value={account.bank}
          />

          <InfoRow
            icon={<WalletCards size={13} />}
            label="Role"
            value={account.type}
          />

          {account.riskLevel && (
            <div className="flex items-center gap-2">
              <ShieldAlert
                size={13}
                className="text-slate-400"
              />

              <span className="text-[10px] text-slate-400">
                Risk
              </span>

              <div className="ml-auto">
                <RiskIndicator
                  risk={account.riskLevel}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>
          Connected activity
        </SectionTitle>

        <div className="mt-2 space-y-2">
          {connected.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-3">
              <p className="text-[10px] leading-4 text-slate-400">
                No direct transaction record is available.
              </p>
            </div>
          ) : (
            connected.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold text-slate-700">
                    {transaction.id}
                  </span>

                  <span className="text-[10px] font-semibold text-slate-800">
                    ₹
                    {transaction.amount.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-400">
                  <Clock3 size={10} />
                  {transaction.type}
                  <span>·</span>
                  {transaction.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

/* ========================================================================== */
/* CASHOUT DETAILS                                                            */
/* ========================================================================== */

function CashoutDetails({
  location,
}: {
  location: PredictedLocation;
}) {
  return (
    <>
      <div className="rounded-xl border border-teal-100 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <MapPin size={16} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-800">
              {location.name}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {location.type} · {location.area}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Metric
            label="Confidence"
            value={`${location.confidence}%`}
          />

          <Metric
            label="Distance"
            value={`${location.distanceKm} km`}
          />
        </div>
      </div>

      <div>
        <SectionTitle>
          Predicted withdrawal window
        </SectionTitle>

        <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <Clock3
            size={13}
            className="text-teal-600"
          />

          <span className="text-[11px] font-medium text-slate-700">
            {location.predictedWindow}
          </span>
        </div>
      </div>

      <div>
        <SectionTitle>
          Why this matters
        </SectionTitle>

        <p className="mt-2 text-[11px] leading-5 text-slate-500">
          {location.reasonSummary}
        </p>
      </div>
    </>
  );
}

/* ========================================================================== */
/* PATTERN DETAILS                                                            */
/* ========================================================================== */

function PatternDetails({
  pattern,
}: {
  pattern: (typeof cityPatterns)[number];
}) {
  return (
    <>
      <div className="rounded-xl border border-blue-100 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium text-slate-400">
              Pattern similarity
            </p>

            <p className="mt-1 text-[25px] font-bold tracking-tight text-blue-700">
              {pattern.match}%
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Network size={17} />
          </div>
        </div>

        <p className="mt-3 text-[12px] font-semibold leading-5 text-slate-800">
          {pattern.label}
        </p>
      </div>

      <div>
        <SectionTitle>
          Observed areas
        </SectionTitle>

        <div className="mt-2 flex flex-wrap gap-2">
          {pattern.areas.map((area) => (
            <span
              key={area}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

     

      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
        <p className="text-[10px] font-semibold text-blue-800">
          Intelligence signal
        </p>

        <p className="mt-1 text-[10px] leading-5 text-blue-700">
          Similar transaction structures have been observed in
          the surrounding investigation area.
        </p>
      </div>
    </>
  );
}

/* ========================================================================== */
/* RELATED CASE DETAILS                                                       */
/* ========================================================================== */

function RelatedCaseDetails({
  caseData,
}: {
  caseData: (typeof relatedCases)[number];
}) {
  return (
    <>
      <div className="rounded-xl border border-blue-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ShieldAlert size={16} />
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-800">
              {caseData.id}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {caseData.type}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <InfoRow
          icon={
            <CircleDollarSign size={13} />
          }
          label="Amount"
          value={`₹${caseData.amount.toLocaleString(
            "en-IN",
          )}`}
        />

        <InfoRow
          icon={<MapPin size={13} />}
          label="Area"
          value={caseData.area}
        />

        <InfoRow
          icon={<Clock3 size={13} />}
          label="Reported"
          value={caseData.date}
        />
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
        <p className="text-[10px] font-semibold text-blue-800">
          Relationship to current case
        </p>

        <p className="mt-1 text-[10px] leading-5 text-blue-700">
          {caseData.similarity}% structural similarity was
          identified with the current investigation.
        </p>
      </div>
    </>
  );
}

/* ========================================================================== */
/* EDGE HELPERS                                                               */
/* ========================================================================== */

/**
 * Use this for EVERY relationship where the nodes are aligned.
 *
 * Horizontal:
 *
 * Victim ─────────► Mule ─────────► Cash-out
 *
 * Vertical:
 *
 *        Beneficiary
 *             ▲
 *             │
 *            Mule
 *
 * No curves.
 * No corners.
 * No smoothstep.
 */
function createStraightEdge({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
  color,
  dashed = false,
  animated = false,
}: {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  color: string;
  dashed?: boolean;
  animated?: boolean;
}): Edge {
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,

    type: "straight",

    animated,

    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 13,
      height: 13,
      color,
    },

    style: {
      stroke: color,
      strokeWidth: animated ? 2.2 : 1.7,

      ...(dashed
        ? {
            strokeDasharray: "5 4",
          }
        : {}),
    },
  };
}

/**
 * Keep this helper available only for cases where a node
 * is genuinely offset from another node.
 *
 * It uses hard 90-degree corners.
 *
 * IMPORTANT:
 * Do NOT use smoothstep.
 */


function RiskIndicator({
  risk,
}: {
  risk:
    | "Low"
    | "Medium"
    | "High"
    | "Critical";
}) {
  const config = {
    Low: {
      dot: "bg-emerald-500",
      text: "text-emerald-600",
    },
    Medium: {
      dot: "bg-yellow-500",
      text: "text-yellow-600",
    },
    High: {
      dot: "bg-orange-500",
      text: "text-orange-600",
    },
    Critical: {
      dot: "bg-red-500",
      text: "text-red-600",
    },
  }[risk];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${config.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      {risk}
    </span>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
      {children}
    </p>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-slate-400">
        {icon}
      </span>

      <span className="text-[10px] text-slate-400">
        {label}
      </span>

      <span className="ml-auto max-w-[170px] truncate text-right text-[11px] font-medium text-slate-700">
        {value}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
      <p className="text-[9px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[12px] font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function Legend({
  dot,
  label,
}: {
  dot: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`h-1.5 w-1.5 rounded-full ${dot}`}
      />

      <span className="text-[10px] text-slate-400">
        {label}
      </span>
    </div>
  );
}

function PanelHint({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold text-slate-700">
        {label}
      </p>

      <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function getEntityDescription(
  type: EntityType,
) {
  switch (type) {
    case "victim":
      return "Victim account";

    case "mule":
      return "Suspected mule account";

    case "beneficiary":
      return "Beneficiary account";

    case "cashout":
      return "Predicted withdrawal location";

    case "pattern":
      return "City-level fraud pattern";

    case "related-case":
      return "Related historical case";

    default:
      return "Investigation entity";
  }
}