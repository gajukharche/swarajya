'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PageSectionItem, DEFAULT_HOMEPAGE_SECTIONS, SectionType } from '@/lib/theme/sections-registry';
import { saveThemeSectionsAction } from './actions';
import { Eye, EyeOff, GripVertical, Plus, Save, Monitor, Smartphone, Check, Loader2 } from 'lucide-react';

export default function ThemeCustomizerPage() {
  const [sections, setSections] = useState<PageSectionItem[]>(DEFAULT_HOMEPAGE_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string>(DEFAULT_HOMEPAGE_SECTIONS[0].id);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send update to iframe whenever sections state changes
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'APEX_THEME_UPDATE', sections },
        '*'
      );
    }
  }, [sections]);

  const activeSection = sections.find((s) => s.id === activeSectionId);

  const updateSectionSettings = (key: string, value: unknown) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === activeSectionId) {
          return {
            ...s,
            settings: { ...s.settings, [key]: value },
          };
        }
        return s;
      })
    );
  };

  const toggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setSections(copy);
  };

  const addSection = (type: SectionType) => {
    const newId = `${type.toLowerCase()}-${Date.now()}`;
    const newSection: PageSectionItem = {
      id: newId,
      sectionType: type,
      position: sections.length,
      isVisible: true,
      settings: {},
    };
    setSections([...sections, newSection]);
    setActiveSectionId(newId);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveThemeSectionsAction(sections);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -m-8">
      {/* Top Bar */}
      <div className="h-14 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white text-sm">Theme Customizer</span>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
            Live Preview
          </span>
        </div>

        {/* Viewport switch */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded ${viewport === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded ${viewport === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saveSuccess ? 'Saved!' : 'Save Theme'}
        </button>
      </div>

      {/* Split Pane Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Section Blocks & Inspector */}
        <div className="w-96 border-r border-zinc-800 bg-zinc-900/60 flex flex-col shrink-0">
          {/* Section List */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Page Sections
              </span>
              <div className="relative group">
                <button className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </button>
                <div className="hidden group-hover:block absolute right-0 top-6 w-44 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 shadow-2xl z-50 space-y-1">
                  {(['Hero', 'FeaturedCollection', 'PromotionalBanner', 'FAQ'] as SectionType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => addSection(t)}
                      className="w-full text-left px-2 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 rounded"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              {sections.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => setActiveSectionId(s.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    activeSectionId === s.id
                      ? 'border-indigo-500 bg-indigo-950/20 text-white'
                      : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="font-medium">{s.sectionType}</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-1 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => toggleVisibility(s.id)}
                      className="p-1 hover:text-white text-zinc-400"
                    >
                      {s.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Inspector Properties */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Section Settings: {activeSection?.sectionType}
            </span>

            {activeSection?.sectionType === 'Hero' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Heading</label>
                  <input
                    type="text"
                    value={String(activeSection.settings.heading || '')}
                    onChange={(e) => updateSectionSettings('heading', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Subheading</label>
                  <textarea
                    rows={3}
                    value={String(activeSection.settings.subheading || '')}
                    onChange={(e) => updateSectionSettings('subheading', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={String(activeSection.settings.buttonText || '')}
                    onChange={(e) => updateSectionSettings('buttonText', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            )}

            {activeSection?.sectionType === 'FeaturedCollection' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Heading</label>
                  <input
                    type="text"
                    value={String(activeSection.settings.heading || '')}
                    onChange={(e) => updateSectionSettings('heading', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Subheading</label>
                  <input
                    type="text"
                    value={String(activeSection.settings.subheading || '')}
                    onChange={(e) => updateSectionSettings('subheading', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            )}

            {activeSection?.sectionType === 'PromotionalBanner' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Badge</label>
                  <input
                    type="text"
                    value={String(activeSection.settings.badge || '')}
                    onChange={(e) => updateSectionSettings('badge', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={String(activeSection.settings.headline || '')}
                    onChange={(e) => updateSectionSettings('headline', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={String(activeSection.settings.description || '')}
                    onChange={(e) => updateSectionSettings('description', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Live Iframe Preview */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center p-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl bg-zinc-900 ${
              viewport === 'desktop' ? 'w-full' : 'w-[420px]'
            }`}
          >
            <iframe
              ref={iframeRef}
              src="/admin/theme-customizer/preview"
              title="Theme Preview"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
