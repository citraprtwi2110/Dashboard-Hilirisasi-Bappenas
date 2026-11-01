import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrenggalekState,
  RespondentProfile,
  AhpEntry,
  ConfirmEntry,
  TrenggalekConfig,
  makeDemo,
  computeAHP,
  computeConfirm,
  AhpComputationResult,
  ConfirmComputationResult
} from '../data/trenggalekData';

const LOCAL_STORAGE_KEY = 'ahp_trenggalek_public_state_v1';
const USER_ID_KEY = 'ahp_trenggalek_uid_v1';
const BROADCAST_CHANNEL = 'ahp_trenggalek_sync_channel';

function getOrCreateUid(): string {
  try {
    let uid = localStorage.getItem(USER_ID_KEY);
    if (!uid) {
      uid = 'u_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(USER_ID_KEY, uid);
    }
    return uid;
  } catch (e) {
    return 'u_guest_' + Math.random().toString(36).substring(2, 8);
  }
}

function loadInitialState(): TrenggalekState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.respondents) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse local storage state', e);
  }
  // If brand new, initialize with default seed demo data so the public dashboard is immediately rich and informative!
  const demo = makeDemo();
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demo));
  } catch (e) {}
  return demo;
}

export function useTrenggalekStore() {
  const [state, setState] = useState<TrenggalekState>(loadInitialState);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoData, setDemoData] = useState<TrenggalekState>(() => makeDemo());
  const [myUid] = useState<string>(getOrCreateUid);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [onlyConsistent, setOnlyConsistent] = useState<boolean>(false);
  const [selectedRespondent, setSelectedRespondent] = useState<string>('group');
  const [activeThreshold, setActiveThreshold] = useState<number | null>(null);

  // Sync state to LocalStorage and broadcast channel
  const persistState = useCallback((newState: TrenggalekState) => {
    setState(newState);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL);
        bc.postMessage({ type: 'STATE_UPDATE', payload: newState });
        bc.close();
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, []);

  // Listen for BroadcastChannel updates from other tabs
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel(BROADCAST_CHANNEL);
    bc.onmessage = (event) => {
      if (event.data?.type === 'STATE_UPDATE' && event.data?.payload) {
        setState(event.data.payload);
      }
    };
    return () => bc.close();
  }, []);

  // Attempt backend API sync if available (non-blocking)
  useEffect(() => {
    let isMounted = true;
    async function syncFromBackend() {
      try {
        const res = await fetch('/api/trenggalek/state');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.respondents && Object.keys(data.respondents).length > 0) {
            persistState(data);
          }
        }
      } catch (err) {
        // Backend API not reachable or static host; local state remains active
      }
    }
    syncFromBackend();
    return () => {
      isMounted = false;
    };
  }, [persistState]);

  // Active data based on demo mode toggle
  const currentData = useMemo(() => {
    return isDemoMode ? demoData : state;
  }, [isDemoMode, demoData, state]);

  // Current respondent profile
  const myProfile = useMemo(() => {
    return currentData.respondents[myUid] || null;
  }, [currentData, myUid]);

  // Current respondent answers
  const myAhp = useMemo(() => {
    return currentData.ahp[myUid]?.j || {};
  }, [currentData, myUid]);

  const myConfirm = useMemo(() => {
    return (
      currentData.confirm[myUid] || {
        votes: {},
        notes: {},
        proposals: [],
        submitted: false,
        updatedAt: 0
      }
    );
  }, [currentData, myUid]);

  // Effective weights map
  const effectiveRespondents = useMemo(() => {
    const out: Record<string, RespondentProfile> = {};
    const wConfig = currentData.config.weights || {};
    Object.keys(currentData.respondents).forEach((u) => {
      out[u] = {
        ...currentData.respondents[u],
        weight: wConfig[u] != null ? +wConfig[u] : 1
      };
    });
    return out;
  }, [currentData]);

  // Derived calculations
  const ahpResult: AhpComputationResult = useMemo(() => {
    if (selectedRespondent !== 'group' && effectiveRespondents[selectedRespondent]) {
      return computeAHP(
        { [selectedRespondent]: effectiveRespondents[selectedRespondent] },
        { [selectedRespondent]: currentData.ahp[selectedRespondent] || { j: {}, updatedAt: 0 } },
        {}
      );
    }
    return computeAHP(effectiveRespondents, currentData.ahp, { onlyConsistent });
  }, [effectiveRespondents, currentData.ahp, selectedRespondent, onlyConsistent]);

  const effectiveThreshold = useMemo(() => {
    if (activeThreshold != null) return activeThreshold;
    return currentData.config.threshold ?? 0.7;
  }, [activeThreshold, currentData.config.threshold]);

  const confirmResult: ConfirmComputationResult = useMemo(() => {
    return computeConfirm(effectiveRespondents, currentData.confirm, ahpResult.global, effectiveThreshold);
  }, [effectiveRespondents, currentData.confirm, ahpResult.global, effectiveThreshold]);

  // Actions
  const saveMyProfile = useCallback(
    (profile: { name: string; org: string; role: string }) => {
      if (isDemoMode) {
        setIsDemoMode(false);
      }
      setSaveStatus('saving');
      const prev = state.respondents[myUid] || {};
      const updatedProfile: RespondentProfile = {
        ...prev,
        ...profile,
        createdAt: prev.createdAt || Date.now()
      };

      const newState: TrenggalekState = {
        ...state,
        respondents: {
          ...state.respondents,
          [myUid]: updatedProfile
        }
      };

      persistState(newState);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);

      // Async backend sync if available
      fetch('/api/trenggalek/respondent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: myUid, profile: updatedProfile })
      }).catch(() => {});
    },
    [isDemoMode, state, myUid, persistState]
  );

  const saveAhpPair = useCallback(
    (pairKey: string, kValue: number) => {
      if (isDemoMode) return;
      setSaveStatus('saving');
      const prevJ = state.ahp[myUid]?.j || {};
      const newJ = { ...prevJ, [pairKey]: kValue };
      const updatedAhpEntry: AhpEntry = {
        j: newJ,
        updatedAt: Date.now()
      };

      const newState: TrenggalekState = {
        ...state,
        ahp: {
          ...state.ahp,
          [myUid]: updatedAhpEntry
        }
      };

      persistState(newState);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);

      fetch('/api/trenggalek/ahp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: myUid, entry: updatedAhpEntry })
      }).catch(() => {});
    },
    [isDemoMode, state, myUid, persistState]
  );

  const saveVote = useCallback(
    (varId: string, vote: 'S' | 'C' | 'T') => {
      if (isDemoMode) return;
      setSaveStatus('saving');
      const prevConf = state.confirm[myUid] || {
        votes: {},
        notes: {},
        proposals: [],
        submitted: false,
        updatedAt: 0
      };

      const updatedConf: ConfirmEntry = {
        ...prevConf,
        votes: {
          ...prevConf.votes,
          [varId]: vote
        },
        submitted: false,
        updatedAt: Date.now()
      };

      const newState: TrenggalekState = {
        ...state,
        confirm: {
          ...state.confirm,
          [myUid]: updatedConf
        }
      };

      persistState(newState);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);

      fetch('/api/trenggalek/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: myUid, entry: updatedConf })
      }).catch(() => {});
    },
    [isDemoMode, state, myUid, persistState]
  );

  const saveNote = useCallback(
    (varId: string, noteText: string) => {
      if (isDemoMode) return;
      const prevConf = state.confirm[myUid] || {
        votes: {},
        notes: {},
        proposals: [],
        submitted: false,
        updatedAt: 0
      };

      const updatedConf: ConfirmEntry = {
        ...prevConf,
        notes: {
          ...prevConf.notes,
          [varId]: noteText.slice(0, 300)
        },
        submitted: false,
        updatedAt: Date.now()
      };

      const newState: TrenggalekState = {
        ...state,
        confirm: {
          ...state.confirm,
          [myUid]: updatedConf
        }
      };

      persistState(newState);

      fetch('/api/trenggalek/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: myUid, entry: updatedConf })
      }).catch(() => {});
    },
    [isDemoMode, state, myUid, persistState]
  );

  const addProposal = useCallback(
    (text: string) => {
      if (isDemoMode || !text.trim()) return;
      const prevConf = state.confirm[myUid] || {
        votes: {},
        notes: {},
        proposals: [],
        submitted: false,
        updatedAt: 0
      };

      const updatedConf: ConfirmEntry = {
        ...prevConf,
        proposals: [...(prevConf.proposals || []), text.trim()],
        updatedAt: Date.now()
      };

      const newState: TrenggalekState = {
        ...state,
        confirm: {
          ...state.confirm,
          [myUid]: updatedConf
        }
      };

      persistState(newState);

      fetch('/api/trenggalek/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: myUid, entry: updatedConf })
      }).catch(() => {});
    },
    [isDemoMode, state, myUid, persistState]
  );

  const setSubmittedStatus = useCallback(
    (submitted: boolean) => {
      if (isDemoMode) return;
      const prevConf = state.confirm[myUid] || {
        votes: {},
        notes: {},
        proposals: [],
        submitted: false,
        updatedAt: 0
      };

      const updatedConf: ConfirmEntry = {
        ...prevConf,
        submitted,
        updatedAt: Date.now()
      };

      const newState: TrenggalekState = {
        ...state,
        confirm: {
          ...state.confirm,
          [myUid]: updatedConf
        }
      };

      persistState(newState);

      fetch('/api/trenggalek/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: myUid, entry: updatedConf })
      }).catch(() => {});
    },
    [isDemoMode, state, myUid, persistState]
  );

  const updateConfig = useCallback(
    (newConfig: Partial<TrenggalekConfig>) => {
      const mergedConfig = { ...state.config, ...newConfig };
      const newState: TrenggalekState = {
        ...state,
        config: mergedConfig
      };
      persistState(newState);

      fetch('/api/trenggalek/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedConfig)
      }).catch(() => {});
    },
    [state, persistState]
  );

  const deleteRespondent = useCallback(
    (uid: string) => {
      const nextRespondents = { ...state.respondents };
      delete nextRespondents[uid];
      const nextAhp = { ...state.ahp };
      delete nextAhp[uid];
      const nextConfirm = { ...state.confirm };
      delete nextConfirm[uid];

      const newState: TrenggalekState = {
        ...state,
        respondents: nextRespondents,
        ahp: nextAhp,
        confirm: nextConfirm
      };
      persistState(newState);

      fetch('/api/trenggalek/delete-respondent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      }).catch(() => {});
    },
    [state, persistState]
  );

  const resetAllData = useCallback(() => {
    const freshDemo = makeDemo();
    persistState(freshDemo);
  }, [persistState]);

  return {
    state: currentData,
    isDemoMode,
    setIsDemoMode,
    myUid,
    myProfile,
    myAhp,
    myConfirm,
    effectiveRespondents,
    ahpResult,
    confirmResult,
    effectiveThreshold,
    setActiveThreshold,
    onlyConsistent,
    setOnlyConsistent,
    selectedRespondent,
    setSelectedRespondent,
    saveStatus,
    errorMessage,
    saveMyProfile,
    saveAhpPair,
    saveVote,
    saveNote,
    addProposal,
    setSubmittedStatus,
    updateConfig,
    deleteRespondent,
    resetAllData
  };
}
