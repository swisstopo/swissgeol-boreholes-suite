import styled from "styled-components";

export const Container = styled.div``;
export const LayerContainer = styled.div`
  flex: 1 1 100%;
  overflow-y: auto;
`;

export const Layer = styled.div`
  box-shadow: inset -1px 0 0 lightgrey, inset 0 -1px 0 lightgrey;
  border-left: 2px solid lightgrey;
  border-top: ${props => props.isFirst && "1px solid lightgrey"};
  flex: "1 1 0px",
  overflowY: "auto",
`;
