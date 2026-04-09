import { use } from 'react';
import { AppContext } from './app-context.shared';

export const useAppContext = () => {
  const context = use(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const useHouseholdBootstrap = () => {
  const context = useAppContext();
  return {
    profile: context.profile,
    household: context.household,
    members: context.members,
    baby: context.baby,
    authStatus: context.authStatus,
    isLoading: context.isLoading,
  };
};

export const useActiveSleepSession = () => {
  const { homeSummary, startSleep, finishSleep } = useAppContext();
  return {
    activeSleepSession: homeSummary.activeSleepSession,
    startSleep,
    finishSleep,
  };
};

export const useActiveFeedSession = () => {
  const { homeSummary, toggleFeedSide, finishFeedSession, undoFeedAction, resetFeedSession } = useAppContext();
  return {
    activeFeedSession: homeSummary.activeFeedSession,
    toggleFeedSide,
    finishFeedSession,
    undoFeedAction,
    resetFeedSession,
  };
};

export const useTimeline = () => {
  const { timeline, refreshData } = useAppContext();
  return { timeline, refreshData };
};

export const useReportsSummary = () => {
  const { reportsSummary, refreshData } = useAppContext();
  return { reportsSummary, refreshData };
};

export const useDoctorSummary = () => {
  const {
    doctorSummary,
    doctorWindow,
    setDoctorWindow,
    saveDoctorAppointment,
    addDoctorQuestion,
    deleteDoctorQuestion,
    addDoctorNote,
  } = useAppContext();

  return {
    doctorSummary,
    doctorWindow,
    setDoctorWindow,
    saveDoctorAppointment,
    addDoctorQuestion,
    deleteDoctorQuestion,
    addDoctorNote,
  };
};
