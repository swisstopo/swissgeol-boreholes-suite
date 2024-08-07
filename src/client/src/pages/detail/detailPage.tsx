import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.js";
import { FC } from "react";
import DetailSideNav from "./detailSideNav";
import DetailPageContent from "./detailPageContent";
import DetailHeader from "./detailHeader.tsx";

export const DetailPage: FC = () => {
  return (
    <>
      <DetailHeader />
      <LayoutBox>
        <SidebarBox>
          <DetailSideNav />
        </SidebarBox>
        <MainContentBox>
          <DetailPageContent />
        </MainContentBox>
      </LayoutBox>
    </>
  );
};
