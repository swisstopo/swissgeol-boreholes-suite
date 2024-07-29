import { LayoutBox, MainContentBox, SidebarBox } from "../components/baseComponents.js";
import { FC } from "react";
import DetailSideNav from "../commons/menu/detailView/detailSideNav";
import BoreholeForm from "../commons/form/borehole/boreholeForm";
import DetailHeader from "../commons/menu/detailView/detailHeader.tsx";

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
