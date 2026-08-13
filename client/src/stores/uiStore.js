import { create } from 'zustand';
export const useUIStore = create(set => ({
  activePanel: null,
  leftPanelOpen: true,
  rightPanelOpen: true,
  isOnline: navigator.onLine,
  setActivePanel: panel => set(state => ({
    activePanel: state.activePanel === panel ? null : panel
  })),
  toggleLeftPanel: () => set(state => ({
    leftPanelOpen: !state.leftPanelOpen
  })),
  toggleRightPanel: () => set(state => ({
    rightPanelOpen: !state.rightPanelOpen
  })),
  setOnline: online => set({
    isOnline: online
  }),
  closeAllPanels: () => set({
    activePanel: null,
    leftPanelOpen: false,
    rightPanelOpen: false
  })
}));
