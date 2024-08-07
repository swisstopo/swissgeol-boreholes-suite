import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.js";
import { FC } from "react";
import DetailSideNav from "./detailSideNav";
import BoreholeForm from "./detailPageContent";
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
          <BoreholeForm />
        </MainContentBox>
      </LayoutBox>
    </>
  );
};
