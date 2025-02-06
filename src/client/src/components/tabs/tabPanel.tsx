import { SyntheticEvent, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { BdmsTab, BdmsTabContentBox, BdmsTabs } from "../styledTabComponents.tsx";

interface Tab {
  label: string;
  hash: string;
  component: JSX.Element;
}

export const TabPanel = ({ tabs }: { tabs: Tab[] }) => {
  const history = useHistory();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Initialize and update activeIndex based on the current URL hash
  useEffect(() => {
    const currentHash = location.hash.replace("#", "");
    const newActiveIndex = tabs.findIndex(tab => tab.hash === currentHash);
    if (newActiveIndex > -1) {
      setActiveIndex(newActiveIndex);
    } else {
      // Redirect to the first tab if hash is not valid
      history.replace(`${location.pathname}#${tabs[0].hash}`);
    }
  }, [location, history, tabs]);

  // Change handler for tab selection
  const handleIndexChange = (event: SyntheticEvent | null, index: number) => {
    const newLocation = location.pathname + "#" + tabs[index].hash;
    if (location.pathname + location.hash !== newLocation) {
      history.push(newLocation);
    }
  };

  return (
    <>
      <BdmsTabs value={activeIndex} onChange={handleIndexChange}>
        {tabs.map(tab => (
          <BdmsTab data-cy={`${tab.hash}-tab`} label={tab.label} key={tab.hash} />
        ))}
      </BdmsTabs>
      <BdmsTabContentBox flex="1 0 0">{tabs[activeIndex].component}</BdmsTabContentBox>
    </>
  );
};
