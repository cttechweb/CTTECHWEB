import React, { useState } from "react";
import { Plus, Trash2, Edit3, Save, Layers, Sliders, ChevronRight, Check, Sparkles, ArrowLeft, RefreshCw, GitBranch, List, Image as ImageIcon, Upload } from "lucide-react";
import { Workflow, WorkflowStep, WorkflowOption, Product, ServiceItem } from "../../types";
import MindMapCanvas, { compressImageFile, HVAC_IMAGE_PRESETS, ImagePositionAdjuster } from "./MindMapCanvas";

interface SmartSelectionBuilderProps {
  workflows: Workflow[];
  products?: Product[];
  services?: ServiceItem[];
  onAddWorkflow: (workflow: Workflow) => void;
  onUpdateWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onResetDefaultWorkflows?: () => void;
  onShowToast?: (msg: string) => void;
}

export default function SmartSelectionBuilder({
  workflows,
  products = [],
  services = [],
  onAddWorkflow,
  onUpdateWorkflow,
  onDeleteWorkflow,
  onResetDefaultWorkflows,
  onShowToast
}: SmartSelectionBuilderProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    workflows[0]?.id || ""
  );

  const [viewMode, setViewMode] = useState<"mindmap" | "list">("mindmap");

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const [activeStepId, setActiveStepId] = useState<string>("");

  // Workflow Editor Form State
  const [isEditingWorkflowMeta, setIsEditingWorkflowMeta] = useState(false);
  const [metaName, setMetaName] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaBadge, setMetaBadge] = useState("");
  const [metaImage, setMetaImage] = useState("");
  const [metaImagePosition, setMetaImagePosition] = useState("50% 50%");
  const [metaDisplayMode, setMetaDisplayMode] = useState<"text" | "image">("image");
  const [metaCategory, setMetaCategory] = useState("air-conditioners");

  // Step Editor Modal/Form State
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);

  // Helper when switching workflow
  const handleSelectWorkflow = (wfId: string) => {
    setSelectedWorkflowId(wfId);
    setIsEditingWorkflowMeta(false);
  };

  const handleStartEditMeta = () => {
    if (!activeWorkflow) return;
    setMetaName(activeWorkflow.name);
    setMetaDescription(activeWorkflow.description);
    setMetaBadge(activeWorkflow.badge || "");
    setMetaImage(activeWorkflow.image || "");
    setMetaImagePosition(activeWorkflow.imagePosition || "50% 50%");
    setMetaDisplayMode(activeWorkflow.displayMode || (activeWorkflow.image ? "image" : "text"));
    setMetaCategory(activeWorkflow.targetCategory);
    setIsEditingWorkflowMeta(true);
  };

  const handleSaveMeta = () => {
    if (!activeWorkflow) return;
    const updated: Workflow = {
      ...activeWorkflow,
      name: metaName,
      description: metaDescription,
      badge: metaBadge,
      displayMode: metaDisplayMode,
      image: metaDisplayMode === "image" ? (metaImage.trim() || undefined) : undefined,
      imagePosition: metaDisplayMode === "image" && metaImage.trim() ? metaImagePosition : undefined,
      targetCategory: metaCategory
    };
    onUpdateWorkflow(updated);
    setIsEditingWorkflowMeta(false);
    if (onShowToast) onShowToast(`Updated workflow "${updated.name}".`);
  };

  const handleCreateNewWorkflow = () => {
    const newId = `wf-custom-${Date.now()}`;
    const newWf: Workflow = {
      id: newId,
      name: "New Custom Equipment Workflow",
      slug: `custom-${Date.now()}`,
      description: "Custom decision tree step workflow.",
      badge: "CUSTOM",
      image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
      imagePosition: "50% 50%",
      iconName: "Sliders",
      targetCategory: "air-conditioners",
      steps: [
        {
          id: `step-${Date.now()}-1`,
          stepNumber: 1,
          title: "1. What is your requirement?",
          subtitle: "Select an option below to proceed.",
          inputType: "cards",
          displayMode: "text",
          options: [
            { id: `opt-${Date.now()}-1`, label: "Option A", description: "Standard choice A" },
            { id: `opt-${Date.now()}-2`, label: "Option B", description: "Standard choice B" }
          ]
        }
      ]
    };
    onAddWorkflow(newWf);
    setSelectedWorkflowId(newId);
    if (onShowToast) onShowToast("Created new equipment workflow.");
  };

  const handleDeleteActiveWorkflow = () => {
    if (!activeWorkflow) return;
    if (workflows.length <= 1) {
      alert("You must keep at least one workflow.");
      return;
    }
    if (window.confirm(`Delete workflow "${activeWorkflow.name}"?`)) {
      onDeleteWorkflow(activeWorkflow.id);
      setSelectedWorkflowId(workflows.find((w) => w.id !== activeWorkflow.id)?.id || "");
      if (onShowToast) onShowToast(`Deleted workflow.`);
    }
  };

  // Step Management
  const handleAddStep = () => {
    if (!activeWorkflow) return;
    const stepNum = activeWorkflow.steps.length + 1;
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      stepNumber: stepNum,
      title: `${stepNum}. New Decision Tree Step Question`,
      subtitle: "Select the option that best fits your criteria.",
      inputType: "cards",
      displayMode: "text",
      options: [
        { id: `opt-${Date.now()}-1`, label: "Choice 1", description: "First choice details" },
        { id: `opt-${Date.now()}-2`, label: "Choice 2", description: "Second choice details" }
      ]
    };
    const updated: Workflow = {
      ...activeWorkflow,
      steps: [...activeWorkflow.steps, newStep]
    };
    onUpdateWorkflow(updated);
    if (onShowToast) onShowToast(`Added Step ${stepNum}.`);
  };

  const handleDeleteStep = (stepId: string) => {
    if (!activeWorkflow) return;
    if (activeWorkflow.steps.length <= 1) {
      alert("A workflow must have at least 1 step.");
      return;
    }
    const updatedSteps = activeWorkflow.steps
      .filter((s) => s.id !== stepId)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));

    const updated: Workflow = {
      ...activeWorkflow,
      steps: updatedSteps
    };
    onUpdateWorkflow(updated);
    if (onShowToast) onShowToast("Deleted step.");
  };

  const handleOpenEditStep = (step: WorkflowStep) => {
    setEditingStep(JSON.parse(JSON.stringify(step))); // Deep clone for editing
    setIsStepModalOpen(true);
  };

  const handleSaveStepModal = () => {
    if (!editingStep || !activeWorkflow) return;
    const updatedSteps = activeWorkflow.steps.map((s) =>
      s.id === editingStep.id ? editingStep : s
    );
    const updated: Workflow = {
      ...activeWorkflow,
      steps: updatedSteps
    };
    onUpdateWorkflow(updated);
    setIsStepModalOpen(false);
    setEditingStep(null);
    if (onShowToast) onShowToast(`Saved Step ${editingStep.stepNumber}.`);
  };

  return (
    <div className="space-y-6">

      {/* 1. Header Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs gap-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles size={16} className="text-[#0f4c81]" />
            <span>Visual Selection Assistant Builder</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Design interactive equipment decision tree workflows
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("mindmap")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === "mindmap"
                ? "bg-[#0f4c81] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <GitBranch size={13} />
              <span>Visual Flowchart Canvas</span>
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === "list"
                ? "bg-[#0f4c81] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <List size={13} />
              <span>Step List View</span>
            </button>
          </div>

          {onResetDefaultWorkflows && (
            <button
              onClick={onResetDefaultWorkflows}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset all workflows to initial defaults"
            >
              <RefreshCw size={13} />
              <span>Reset Defaults</span>
            </button>
          )}

          <button
            onClick={handleCreateNewWorkflow}
            className="px-3.5 py-1.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white text-xs font-extrabold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus size={14} />
            <span>+ Create Workflow</span>
          </button>
        </div>
      </div>

      {/* 2. Workflow Tabs Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 items-center scrollbar-none">
        {workflows.map((wf) => {
          const isSelected = wf.id === activeWorkflow?.id;
          return (
            <div key={wf.id} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleSelectWorkflow(wf.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${isSelected
                  ? "bg-[#0f4c81] text-white border-[#0f4c81] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {wf.image && (
                  <img src={wf.image} alt="" style={{ objectPosition: wf.imagePosition || "center" }} className="w-4 h-4 rounded object-cover" />
                )}
                <span>{wf.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                  {wf.steps.length} Steps
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Main Builder Canvas or List View */}
      {activeWorkflow ? (
        viewMode === "mindmap" ? (
          /* Mind Map Interactive Canvas with Node Editor Drawer */
          <MindMapCanvas
            workflow={activeWorkflow}
            products={products}
            services={services}
            onUpdateWorkflow={onUpdateWorkflow}
            onEditWorkflowMeta={handleStartEditMeta}
            onShowToast={onShowToast}
          />
        ) : (
          /* Step List Fallback View */
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">

            {/* Workflow Header / Meta Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {activeWorkflow.image && (
                  <img src={activeWorkflow.image} alt="" style={{ objectPosition: activeWorkflow.imagePosition || "center" }} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-base">{activeWorkflow.name}</h4>
                    {activeWorkflow.badge && (
                      <span className="px-2 py-0.5 bg-blue-50 text-[#0f4c81] text-[10px] font-black uppercase rounded border border-blue-200">
                        {activeWorkflow.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{activeWorkflow.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleStartEditMeta}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Metadata</span>
                </button>

                <button
                  onClick={handleDeleteActiveWorkflow}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Workflow"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Steps Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Configured Decision Tree Steps ({activeWorkflow.steps.length})
                </h5>

                <button
                  onClick={handleAddStep}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Step Question</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {activeWorkflow.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#0f4c81] text-white rounded-md text-[10px] font-black flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <h6 className="font-extrabold text-slate-900 text-xs truncate">
                          {step.title}
                        </h6>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-bold uppercase rounded">
                          {step.inputType}
                        </span>
                      </div>
                      {step.subtitle && (
                        <p className="text-[11px] text-slate-500 pl-7">{step.subtitle}</p>
                      )}
                      <div className="flex gap-2 pl-7 pt-1 flex-wrap">
                        {step.options.map((opt) => (
                          <span
                            key={opt.id}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 font-medium flex items-center gap-1"
                          >
                            {opt.image && <img src={opt.image} alt="" style={{ objectPosition: opt.imagePosition || "center" }} className="w-3 h-3 rounded object-cover" />}
                            <span>{opt.label}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleOpenEditStep(step)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit Step</span>
                      </button>

                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Step"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )
      ) : null}

      {/* Step Edit Modal (List View) */}
      {isStepModalOpen && editingStep && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Sliders size={16} className="text-cyan-400" />
                <span>Edit Step #{editingStep.stepNumber} Question</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsStepModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="font-bold text-slate-700">Question Title *</label>
                <input
                  type="text"
                  value={editingStep.title}
                  onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Subtitle / Guidance Text</label>
                <input
                  type="text"
                  value={editingStep.subtitle || ""}
                  onChange={(e) => setEditingStep({ ...editingStep, subtitle: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {/* Display Format Switch Button */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Choice Card Display Format</label>
                <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full">
                  <button
                    type="button"
                    onClick={() => setEditingStep({ ...editingStep, displayMode: "text" })}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      (editingStep.displayMode || "text") === "text"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    📝 Text-Only Choices
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingStep({ ...editingStep, displayMode: "image" })}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      editingStep.displayMode === "image"
                        ? "bg-[#0f4c81] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    🖼️ Visual Image Choices
                  </button>
                </div>
              </div>

              {/* Options Builder */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 uppercase">
                    {editingStep.displayMode === "image" ? "Visual Image Choices" : "Answer Choice Options"} ({editingStep.options.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newOpt: WorkflowOption = {
                        id: `opt-${Date.now()}`,
                        label: `New Option ${editingStep.options.length + 1}`,
                        description: "Option description details"
                      };
                      setEditingStep({
                        ...editingStep,
                        options: [...editingStep.options, newOpt]
                      });
                    }}
                    className="px-2.5 py-1 bg-[#0f4c81] text-white font-bold text-[11px] rounded-lg cursor-pointer"
                  >
                    + Add Option Choice
                  </button>
                </div>

                <div className="space-y-3">
                  {editingStep.options.map((opt, optIdx) => (
                    <div key={opt.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-500 text-[10px]">Choice #{optIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = editingStep.options.filter((o) => o.id !== opt.id);
                            setEditingStep({ ...editingStep, options: filtered });
                          }}
                          className="text-slate-400 hover:text-red-600 text-[10px] font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {editingStep.displayMode === "image" ? (
                        /* 🖼️ IMAGE MODE: Show Reference Label + Image Uploader & Position Adjuster ONLY */
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500">Option Reference Name *</label>
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) => {
                                const updated = editingStep.options.map((o) =>
                                  o.id === opt.id ? { ...o, label: e.target.value } : o
                                );
                                setEditingStep({ ...editingStep, options: updated });
                              }}
                              className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold bg-white"
                            />
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="Image URL or upload..."
                                value={opt.image || ""}
                                onChange={(e) => {
                                  const updated = editingStep.options.map((o) =>
                                    o.id === opt.id ? { ...o, image: e.target.value } : o
                                  );
                                  setEditingStep({ ...editingStep, options: updated });
                                }}
                                className="flex-1 p-1.5 border border-slate-300 rounded text-xs bg-white"
                              />
                              <label className="px-2.5 py-1.5 bg-slate-200 text-slate-800 text-xs font-bold rounded cursor-pointer shrink-0">
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      compressImageFile(file, (b64) => {
                                        const updated = editingStep.options.map((o) =>
                                          o.id === opt.id ? { ...o, image: b64 } : o
                                        );
                                        setEditingStep({ ...editingStep, options: updated });
                                      });
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {opt.image && (
                              <ImagePositionAdjuster
                                imageUrl={opt.image}
                                position={opt.imagePosition}
                                onChange={(pos) => {
                                  const updated = editingStep.options.map((o) =>
                                    o.id === opt.id ? { ...o, imagePosition: pos } : o
                                  );
                                  setEditingStep({ ...editingStep, options: updated });
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        /* 📝 TEXT MODE: Show Label, Badge, Description ONLY */
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500">Option Label *</label>
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => {
                                  const updated = editingStep.options.map((o) =>
                                    o.id === opt.id ? { ...o, label: e.target.value } : o
                                  );
                                  setEditingStep({ ...editingStep, options: updated });
                                }}
                                className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold bg-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500">Badge (Optional)</label>
                              <input
                                type="text"
                                value={opt.badge || ""}
                                onChange={(e) => {
                                  const updated = editingStep.options.map((o) =>
                                    o.id === opt.id ? { ...o, badge: e.target.value } : o
                                  );
                                  setEditingStep({ ...editingStep, options: updated });
                                }}
                                className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                                placeholder="e.g. Inverter, Heavy Duty"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500">Description / Subtext</label>
                            <input
                              type="text"
                              value={opt.description || ""}
                              onChange={(e) => {
                                const updated = editingStep.options.map((o) =>
                                  o.id === opt.id ? { ...o, description: e.target.value } : o
                                );
                                setEditingStep({ ...editingStep, options: updated });
                              }}
                              className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsStepModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStepModal}
                className="px-4 py-2 bg-[#0f4c81] text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm"
              >
                Save Step Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Workflow Metadata & Cover Image Settings Modal */}
      {isEditingWorkflowMeta && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 size={14} className="text-blue-400" />
                <span>Edit Workflow Title & Category Picture</span>
              </h3>
              <button
                onClick={() => setIsEditingWorkflowMeta(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Category Display Mode Switch Toggle */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">Category Card Display Format</label>
                <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full">
                  <button
                    type="button"
                    onClick={() => setMetaDisplayMode("text")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      metaDisplayMode === "text"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    📝 Text-Only Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetaDisplayMode("image")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      metaDisplayMode === "image"
                        ? "bg-[#0f4c81] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    🖼️ Visual Image Category
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Workflow Title / Name *</label>
                <input
                  type="text"
                  value={metaName}
                  onChange={(e) => setMetaName(e.target.value)}
                  placeholder="e.g. Room Air Conditioner (DX RAC)"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-[#0f4c81] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Category</label>
                <select
                  value={metaCategory}
                  onChange={(e) => setMetaCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white focus:border-[#0f4c81] focus:outline-none"
                >
                  <option value="air-conditioners">Air Conditioners</option>
                  <option value="hvac-systems">HVAC Systems</option>
                  <option value="compressors">Compressors</option>
                  <option value="coils-heat-exchangers">Coils & Heat Exchangers</option>
                  <option value="pipes-fittings">Pipes & Fittings</option>
                  <option value="controls-thermostats">Controls & Thermostats</option>
                </select>
              </div>

              {metaDisplayMode === "image" ? (
                /* 🖼️ IMAGE MODE: Show Cover Picture Uploader & Position Adjuster ONLY */
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 text-[10px] uppercase flex items-center gap-1">
                      <ImageIcon size={12} className="text-[#0f4c81]" />
                      <span>Category Cover Image (Full Card Box)</span>
                    </label>
                    {metaImage && (
                      <button
                        type="button"
                        onClick={() => setMetaImage("")}
                        className="text-red-500 hover:text-red-700 text-[9px] font-bold cursor-pointer"
                      >
                        Clear Image
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Image URL or upload..."
                      value={metaImage}
                      onChange={(e) => setMetaImage(e.target.value)}
                      className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload size={12} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            compressImageFile(file, (b64) => setMetaImage(b64));
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Interactive Hand Tool Position Adjuster (Exact h-52 Container) */}
                  {metaImage && (
                    <ImagePositionAdjuster
                      imageUrl={metaImage}
                      position={metaImagePosition}
                      onChange={(pos) => setMetaImagePosition(pos)}
                    />
                  )}
                </div>
              ) : (
                /* 📝 TEXT MODE: Show Description & Badge ONLY (No image upload or adjuster) */
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Badge (Optional)</label>
                    <input
                      type="text"
                      value={metaBadge}
                      onChange={(e) => setMetaBadge(e.target.value)}
                      placeholder="e.g. MOST POPULAR, RESIDENTIAL"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:border-[#0f4c81] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Description / Subtitle</label>
                    <textarea
                      rows={3}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Brief summary of what this workflow helps customers choose..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:border-[#0f4c81] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingWorkflowMeta(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMeta}
                className="px-5 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save size={13} /> Save Title & Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
