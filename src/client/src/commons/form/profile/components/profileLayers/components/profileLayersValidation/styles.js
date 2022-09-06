import styled from "styled-components";

export const Container = styled.div``;
export const LayerContainer = styled.div`
  flex: 1 1 100%;
  overflow-y: auto;
`;

export const Layer = styled.div`
  border: 1px solid lightgrey;
  border-top: ${props => !props.isFirst && "0px"};
`;
