import { useState, useCallback } from 'react';
import FreelancerNav from '../components/layout/FreelancerNav';
import Footer from '../components/layout/Footer';
import BidderAgentStatusBar from '../components/config/BidderAgentStatusBar';
import PromptEditor from '../components/config/PromptEditor';
import ConfigurationImpactCard from '../components/config/ConfigurationImpactCard';
import BehaviourLogCard from '../components/config/BehaviourLogCard';
import AutoBiddingToggle from '../components/config/AutoBiddingToggle';
import ConfigurationHistory from '../components/config/ConfigurationHistory';
import '../styles/bidder-config.css';

const DEFAULT_PROMPT = `Only bid on data analysis, code generation, and competitive intelligence jobs. Never bid on design, creative, translation, or video jobs.

Bid at 15% below the Buyer's stated budget. Never bid below $50 for any job regardless of budget.

Write all bid proposals in a concise, professional tone. Emphasise speed of delivery and accuracy of output. Lead with the most relevant capability match.

Only bid when match confidence is high — threshold should be equivalent to 75/100 or above. Do not bid on jobs where the required output format is not in our capability set.`;

const useToast = () => {
  const [toast, setToast] = useState({ visible: false, msg: '' });

  const showToast = useCallback((msg) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  }, []);

  return [toast, showToast];
};

const BidderAgentConfigPage = () => {
  const [savedPrompt,  setSavedPrompt]  = useState(DEFAULT_PROMPT);
  const [configState,  setConfigState]  = useState('current');
  const [autoBidding,  setAutoBidding]  = useState(true);
  /* livePrompt mirrors what's in the textarea for the impact card */
  const [livePrompt,   setLivePrompt]   = useState(DEFAULT_PROMPT);
  const [toast, showToast] = useToast();

  /* Called by PromptEditor when save phase fires onSave */
  const handleSave = useCallback((newPrompt) => {
    setSavedPrompt(newPrompt);
    setLivePrompt(newPrompt);
    setConfigState('pending');
    setTimeout(() => setConfigState('current'), 2000);
  }, []);

  /* Called by ConfigurationHistory when user restores a past config */
  const handleRestore = useCallback((text) => {
    setSavedPrompt(text);
    setLivePrompt(text);
  }, []);

  const handleToggle = useCallback((enabled) => {
    setAutoBidding(enabled);
  }, []);

  return (
    <>
      <FreelancerNav activePage="Configuration" />

      <div className="bc-page">
        {/* Page header */}
        <div className="bc-page-header">
          <div>
            <h1 className="bc-page-title">Bidder Agent Configuration</h1>
            <p className="bc-page-sub">
              Control how your Bidder Agent evaluates and bids on jobs. Changes propagate within seconds.
            </p>
          </div>
          <div className={`bc-active-pill${autoBidding ? '' : ' paused'}`}>
            {autoBidding
              ? <><div className="bc-active-pill-dot" />Agent Active</>
              : <>⏸ Agent Paused</>}
          </div>
        </div>

        {/* Status bar */}
        <BidderAgentStatusBar configState={configState} autoBidding={autoBidding} />

        {/* Main 2-col panel */}
        <div className="bc-panel">
          {/* Left: prompt editor */}
          <div>
            <PromptEditor
              currentPrompt={savedPrompt}
              configState={configState}
              onSave={handleSave}
              onRestore={handleRestore}
              onLiveChange={setLivePrompt}
            />
          </div>

          {/* Right: impact + log + toggle */}
          <div className="bc-right-col">
            <ConfigurationImpactCard promptText={livePrompt} />
            <BehaviourLogCard />
            <AutoBiddingToggle
              isEnabled={autoBidding}
              onToggle={handleToggle}
              onToast={showToast}
            />
          </div>
        </div>

        {/* Configuration history */}
        <ConfigurationHistory onRestore={handleRestore} onToast={showToast} />
      </div>

      {/* Global toast */}
      <div className={`bc-toast${toast.visible ? ' visible' : ''}`}>
        {toast.msg}
      </div>
      <Footer />
    </>
  );
};

export default BidderAgentConfigPage;
